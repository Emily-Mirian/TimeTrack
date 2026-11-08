using Microsoft.AspNetCore.Mvc;
using PontoOnline.Domain.Entities;
using PontoOnline.Infrastructure.Context;
using PontoOnline.mvc.Services;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/modulos")]
    [ApiController]
    public class ModulosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ModulosService _modulos;
        private readonly LogService _logService;

        public ModulosController(AppDbContext context, ModulosService modulos, LogService logService)
        {
            _context = context;
            _modulos = modulos;
            _logService = logService;
        }

        [HttpGet]
        public async Task<IActionResult> Obter()
        {
            var c = await _modulos.ObterConfigAsync();
            return Ok(new
            {
                importacao = c.ModuloImportacao,
                exportacao = c.ModuloExportacao,
                edicaoPonto = c.ModuloEdicaoPonto,
                alertasJornada = c.ModuloAlertasJornada
            });
        }

        [HttpPut("{modulo}")]
        public async Task<IActionResult> Alterar(string modulo, [FromBody] ModuloDto dto)
        {
            if (!Modulos.Todos.Contains(modulo))
                return NotFound(new { erro = "Módulo desconhecido." });

            // Só o administrador altera o controle de módulos.
            int? autorId = int.TryParse(Request.Headers["X-Usuario-Id"].FirstOrDefault(), out var id) ? id : null;
            var autor = autorId.HasValue ? await _context.Usuarios.FindAsync(autorId.Value) : null;
            if (autor == null || (autor.NivelAcesso ?? "").ToLower() != "admin")
                return StatusCode(403, new { erro = "Apenas o Administrador pode alterar o controle de módulos." });

            var config = await _modulos.ObterConfigAsync(criar: true);
            ModulosService.Definir(config, modulo, dto.ativo);

            _context.AuditoriaLogs.Add(new AuditoriaLog
            {
                DataHora = DateTime.Now,
                UsuarioResponsavelId = autor.UsuarioId,
                Acao = "alteracao_modulo",
                Detalhes = "Módulo <strong>" + Modulos.Nome(modulo) + "</strong> " + (dto.ativo ? "ativado" : "desativado") + " pelo Administrador."
            });
            await _context.SaveChangesAsync();

            await _logService.RegistrarAsync(
                acao: "Controle de Módulos",
                modulo: "Visão Global",
                detalhes: "Módulo " + Modulos.Nome(modulo) + " " + (dto.ativo ? "ativado" : "desativado"),
                usuario: autor.NomeCompleto,
                nivel: dto.ativo ? "media" : "alta"
            );

            return Ok(new { mensagem = "Módulo atualizado.", modulo, ativo = dto.ativo });
        }
    }

    public class ModuloDto
    {
        public bool ativo { get; set; }
    }
}
