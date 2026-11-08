using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Infrastructure.Context;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/historico")]
    [ApiController]
    public class HistoricoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HistoricoController(AppDbContext context)
        {
            _context = context;
        }

        // tipo = "importacao" | "exportacao"
        [HttpGet("{tipo}")]
        public async Task<IActionResult> Listar(string tipo)
        {
            tipo = tipo.ToLowerInvariant();
            if (tipo != "importacao" && tipo != "exportacao")
                return BadRequest(new { erro = "Tipo inválido. Use 'importacao' ou 'exportacao'." });

            var itens = await _context.HistoricoArquivos
                .Where(h => h.Tipo == tipo)
                .OrderByDescending(h => h.DataHora)
                .Take(200)
                .ToListAsync();

            return Ok(itens.Select(h => new
            {
                id = h.HistoricoId,
                arquivo = h.NomeArquivo,
                data = h.DataHora.ToString("dd/MM/yyyy HH:mm"),
                por = h.UsuarioNome,
                status = h.Status,
                linhas = h.Linhas,
                erroResumo = h.Status == "erro" ? h.Detalhe : null,
                detalhe = h.Detalhe,
                colaboradorId = h.ColaboradorId,
                ano = h.Ano,
                mes = h.Mes
            }));
        }
    }
}
