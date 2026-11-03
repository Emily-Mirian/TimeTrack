using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using PontoOnline.Infrastructure.Context;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VisaoGlobalController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VisaoGlobalController(AppDbContext context)
        {
            _context = context;
        }

        // Retorna as últimas 5 movimentações para o card de Auditoria Recente
        [HttpGet("auditoria-recente")]
        public async Task<IActionResult> ObterAuditoriaRecente()
        {
            var logs = await _context.AuditoriaLogs
                .Include(l => l.UsuarioResponsavel)
                .OrderByDescending(l => l.DataHora)
                .Take(5)
                .ToListAsync();

            var resultado = logs.Select(l => new {
                usuario = l.UsuarioResponsavel?.NivelAcesso?.ToLower() == "rh" ? "Gestor RH" : "Administrador",
                acao = l.Detalhes ?? l.Acao,
                dataHora = l.DataHora.ToString("dd/MM/yyyy HH:mm")
            });

            return Ok(resultado);
        }
    }
}