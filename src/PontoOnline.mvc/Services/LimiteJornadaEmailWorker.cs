using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Services;
using PontoOnline.Infrastructure.Context;

namespace PontoOnline.mvc.Services;

// A cada 5 minutos procura funcionários que já cumpriram 85% da carga diária
// e ainda não saíram, e envia um único e-mail por dia (se a preferência estiver ativa).
public class LimiteJornadaEmailWorker : BackgroundService
{
    private const double PercentualAlerta = 0.85;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LimiteJornadaEmailWorker> _logger;

    public LimiteJornadaEmailWorker(IServiceScopeFactory scopeFactory, ILogger<LimiteJornadaEmailWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await VerificarAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro na verificação de limite de jornada.");
            }

            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }

    private async Task VerificarAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var email = scope.ServiceProvider.GetRequiredService<EmailService>();
        if (!email.Configurado) return;

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var calculo = scope.ServiceProvider.GetRequiredService<CalculoPontoService>();

        var hoje = DateTime.Today;
        var agora = DateTime.Now;

        var registros = await db.RegistrosPonto
            .Include(r => r.Usuario!)
            .ThenInclude(u => u.TipoContrato)
            .Where(r => r.DataRegistro.Date == hoje
                        && r.Entrada1 != null
                        && r.Saida2 == null
                        && !r.AlertaLimiteEnviado)
            .ToListAsync(ct);

        foreach (var r in registros)
        {
            var usuario = r.Usuario;
            if (usuario?.TipoContrato == null) continue;

            var pref = await db.PreferenciasUsuario.FirstOrDefaultAsync(p => p.UsuarioId == usuario.UsuarioId, ct);
            if (pref != null && !pref.AlertaLimiteEmail) continue;

            int meta = usuario.TipoContrato.CargaHorariaDiariaMinutos;
            if (meta <= 0) continue;

            int trabalhado = calculo.CalcularMinutosParciais(r, agora);
            if (trabalhado < meta * PercentualAlerta) continue;

            int restante = Math.Max(meta - trabalhado, 0);
            string corpo =
                $"<p>Olá, {System.Net.WebUtility.HtmlEncode(usuario.NomeCompleto)}.</p>" +
                $"<p>Você já cumpriu <strong>{trabalhado * 100 / meta}%</strong> da sua jornada diária " +
                $"({trabalhado / 60}h{trabalhado % 60:D2} de {meta / 60}h{meta % 60:D2}). " +
                $"Restam {restante / 60}h{restante % 60:D2}.</p>" +
                (usuario.TipoContrato.PermiteHoraExtra
                    ? ""
                    : "<p>Atenção: seu contrato <strong>não permite horas extras</strong>. Registre sua saída ao completar a jornada.</p>") +
                "<p>— TimeTrack</p>";

            bool enviado = await email.EnviarAsync(usuario.Email, "TimeTrack: você está perto do limite da jornada", corpo);
            if (enviado)
            {
                r.AlertaLimiteEnviado = true;
                await db.SaveChangesAsync(ct);
            }
        }
    }
}
