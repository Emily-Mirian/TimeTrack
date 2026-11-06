using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using PontoOnline.Infrastructure.Context;
using PontoOnline.Domain.Entities;

namespace PontoOnline.mvc.Controllers 
{
    [Route("api/[controller]")]
    [ApiController]
    public class PendenciasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogService _logService;

        public PendenciasController(AppDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        [HttpGet]
        public async Task<IActionResult> ObterPendencias()
        {
            var pendencias = new List<object>();

            var atestados = await _context.AusenciasJustificadas
                .Include(a => a.Usuario)
                .ThenInclude(u => u!.TipoContrato)
                .Where(a => a.Status == "Pendente" || a.Status == null)
                .ToListAsync();

            foreach (var a in atestados)
            {
                int idDoUsuario = a.Usuario?.UsuarioId ?? 0;
                
                string nomeBase = "atestado_" + idDoUsuario + "_" + a.DataInicio.ToString("yyyyMMdd");
                string pasta = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "atestados");
                string extensaoCorreta = ".pdf"; 

                string[] extensoes = { ".png", ".jpg", ".jpeg", ".pdf" };
                foreach (var ext in extensoes)
                {
                    if (System.IO.File.Exists(Path.Combine(pasta, nomeBase + ext)))
                    {
                        extensaoCorreta = ext;
                        break;
                    }
                }

                pendencias.Add(new
                {
                    id = "atestado_" + a.AusenciaId, 
                    colaborador = a.Usuario?.NomeCompleto ?? "Colaborador",
                    contrato = a.Usuario?.TipoContrato?.Nome ?? "N/A",
                    data = a.DataInicio.ToString("dd/MM/yyyy"),
                    tipo = "atestado",
                    detalhe = "Atestado de " + a.DataInicio.ToString("dd/MM") + " a " + a.DataFim.ToString("dd/MM"),
                    anexoUrl = "/uploads/atestados/" + nomeBase + extensaoCorreta + "?v=" + DateTime.Now.Ticks
                });
            }

            var hoje = DateTime.Today;
            var batidasImpares = await _context.RegistrosPonto
                .Include(r => r.Usuario)
                .ThenInclude(u => u!.TipoContrato)
                .Where(r => r.DataRegistro < hoje && r.Saida2 == null)
                .ToListAsync();

            foreach (var b in batidasImpares)
            {
                pendencias.Add(new
                {
                    id = "ponto_" + b.PontoId,
                    colaborador = b.Usuario?.NomeCompleto ?? "Colaborador",
                    contrato = b.Usuario?.TipoContrato?.Nome ?? "N/A",
                    data = b.DataRegistro.ToString("dd/MM/yyyy"),
                    tipo = "batida_impar",
                    detalhe = "Batida incompleta (falta registro de saída)"
                });
            }

            return Ok(pendencias);
        }
        
        [HttpPut("ponto/{id}/resolver")]
        public async Task<IActionResult> ResolverBatidaImpar(int id, [FromBody] ResolverPontoDto dto)
        {
            try
            {
                var registro = await _context.RegistrosPonto
                    .Include(r => r.Usuario)
                    .FirstOrDefaultAsync(r => r.PontoId == id);

                if (registro == null) 
                    return NotFound(new { erro = "Registro de ponto não encontrado." });

                registro.Saida2 = dto.NovaSaida;

                int autorId = dto.UsuarioResponsavelId > 0 ? dto.UsuarioResponsavelId : 3;
                string nomeColab = registro.Usuario?.NomeCompleto ?? "Colaborador";

                var logAuditoria = new AuditoriaLog
                {
                    DataHora = DateTime.Now,
                    UsuarioResponsavelId = autorId,
                    Acao = "edicao_ponto",
                    Detalhes = "Batida incompleta de <strong>" + nomeColab + "</strong> (Data: " + registro.DataRegistro.ToString("dd/MM/yyyy") + ") corrigida. Saída registrada: <strong>" + dto.NovaSaida.ToString("HH:mm") + "</strong>."
                };

                _context.AuditoriaLogs.Add(logAuditoria);
                await _context.SaveChangesAsync();

                await _logService.RegistrarAsync(
                    acao: "Resolução de Batida Ímpar",
                    modulo: "Pendências",
                    detalhes: "Ponto corrigido para o colaborador: " + nomeColab,
                    usuario: "Admin",
                    nivel: "media"
                );

                return Ok(new { mensagem = "Batida de ponto resolvida e salva com sucesso!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message, detalhe = ex.InnerException?.Message });
            }
        }
        
        [HttpPut("atestado/{id}/aprovar")]
        public async Task<IActionResult> AprovarAtestado(int id, [FromBody] ValidarAtestadoDto dto)
        {
            try
            {
                var permissaoAtiva = await _context.PermissoesPerfil
                    .FirstOrDefaultAsync(p => p.Funcao == "aprovar_atestados" && p.Perfil == "rh");

                if (permissaoAtiva != null && !permissaoAtiva.Ativo)
                {
                    await _logService.RegistrarAsync(
                        acao: "Tentativa de Ação Bloqueada",
                        modulo: "Segurança e Acessos",
                        detalhes: "O perfil de RH tentou aprovar um atestado, mas a permissão está desativada.",
                        usuario: "Admin",
                        nivel: "alta"
                    );

                    return StatusCode(403, new { erro = "Acesso negado: este perfil não tem permissão para aprovar atestados." });
                }

                var atestado = await _context.AusenciasJustificadas
                    .Include(a => a.Usuario)
                    .FirstOrDefaultAsync(a => a.AusenciaId == id); 

                if (atestado == null) 
                    return NotFound(new { erro = "Atestado não encontrado." });

                atestado.Status = "Aprovado";
                await _context.SaveChangesAsync();

                return Ok(new { mensagem = "Atestado aprovado com sucesso!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }
        public class ValidarAtestadoDto
        {
            public int UsuarioResponsavelId { get; set; }
        }

        public class ResolverPontoDto
        {
            public DateTime NovaSaida { get; set; }
            public int UsuarioResponsavelId { get; set; }
        }
    }
}
