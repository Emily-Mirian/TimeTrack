using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;
using PontoOnline.Infrastructure.Context;

namespace PontoOnline.mvc.Services;

public static class Modulos
{
    public const string Importacao = "importacao";
    public const string Exportacao = "exportacao";
    public const string EdicaoPonto = "edicaoPonto";
    public const string AlertasJornada = "alertasJornada";

    public static readonly string[] Todos = { Importacao, Exportacao, EdicaoPonto, AlertasJornada };

    public static string Nome(string modulo) => modulo switch
    {
        Importacao => "Importação CSV",
        Exportacao => "Exportação PDF",
        EdicaoPonto => "Edição de Ponto",
        AlertasJornada => "Alertas de jornada no dashboard",
        _ => modulo
    };
}

// Lê/grava o Controle de Módulos (Visão Global) e decide se uma ação deve ser bloqueada.
public class ModulosService
{
    private readonly AppDbContext _context;

    public ModulosService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ConfiguracaoGlobal> ObterConfigAsync(bool criar = false)
    {
        var config = await _context.ConfiguracoesGlobais.FirstOrDefaultAsync();
        if (config == null)
        {
            config = new ConfiguracaoGlobal();
            if (criar) _context.ConfiguracoesGlobais.Add(config);
        }
        return config;
    }

    public static bool Ativo(ConfiguracaoGlobal c, string modulo) => modulo switch
    {
        Modulos.Importacao => c.ModuloImportacao,
        Modulos.Exportacao => c.ModuloExportacao,
        Modulos.EdicaoPonto => c.ModuloEdicaoPonto,
        Modulos.AlertasJornada => c.ModuloAlertasJornada,
        _ => true
    };

    public static void Definir(ConfiguracaoGlobal c, string modulo, bool ativo)
    {
        switch (modulo)
        {
            case Modulos.Importacao: c.ModuloImportacao = ativo; break;
            case Modulos.Exportacao: c.ModuloExportacao = ativo; break;
            case Modulos.EdicaoPonto: c.ModuloEdicaoPonto = ativo; break;
            case Modulos.AlertasJornada: c.ModuloAlertasJornada = ativo; break;
        }
    }

    // Módulo desligado bloqueia o RH. O Administrador sempre pode.
    // Solicitante desconhecido é tratado como RH (quem não se identifica não ganha exceção).
    // donoId: o próprio dono do dado (ex.: funcionário baixando o próprio espelho) não é bloqueado.
    public async Task<bool> BloqueadoAsync(string modulo, int? solicitanteId, int? donoId = null)
    {
        var config = await ObterConfigAsync();
        if (Ativo(config, modulo)) return false;

        if (solicitanteId.HasValue)
        {
            if (donoId.HasValue && solicitanteId.Value == donoId.Value) return false;

            var nivel = await _context.Usuarios
                .Where(u => u.UsuarioId == solicitanteId.Value)
                .Select(u => u.NivelAcesso)
                .FirstOrDefaultAsync();

            if ((nivel ?? "").ToLower() == "admin") return false;
        }
        return true;
    }

    public static string MensagemBloqueio(string modulo) =>
        "O módulo \"" + Modulos.Nome(modulo) + "\" está desativado pelo Administrador (Visão Global).";
}
