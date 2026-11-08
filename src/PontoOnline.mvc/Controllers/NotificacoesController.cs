using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Infrastructure.Context;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/notificacoes")]
    [ApiController]
    public class NotificacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificacoesController(AppDbContext context)
        {
            _context = context;
        }

        // Devolve os avisos ainda não vistos e já os marca como lidos (aparecem uma única vez).
        [HttpGet("pendentes/{usuarioId}")]
        public async Task<IActionResult> ObterPendentes(int usuarioId)
        {
            var avisos = await _context.Notificacoes
                .Where(n => n.UsuarioId == usuarioId && !n.Lida)
                .OrderBy(n => n.CriadaEm)
                .ToListAsync();

            foreach (var a in avisos) a.Lida = true;
            if (avisos.Count > 0) await _context.SaveChangesAsync();

            return Ok(avisos.Select(a => new
            {
                id = a.NotificacaoId,
                tipo = a.Tipo,
                mensagem = a.Mensagem,
                data = a.CriadaEm.ToString("dd/MM/yyyy HH:mm")
            }));
        }
    }
}
