using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;
using PontoOnline.Infrastructure.Context;

namespace PontoOnline.mvc.Services;

public class NotificacaoService
{
    private readonly AppDbContext _context;

    public NotificacaoService(AppDbContext context)
    {
        _context = context;
    }

    // Cria o aviso para o funcionário, respeitando a preferência "Notificar-me sobre atestados validados".
    // Não chama SaveChanges: grava junto com a operação que o originou.
    public async Task NotificarDecisaoAsync(int usuarioId, string tipo, string mensagem)
    {
        var pref = await _context.PreferenciasUsuario.FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);
        if (pref != null && !pref.NotificarAtestados) return;

        _context.Notificacoes.Add(new Notificacao
        {
            UsuarioId = usuarioId,
            Tipo = tipo,
            Mensagem = mensagem,
            CriadaEm = DateTime.Now
        });
    }
}
