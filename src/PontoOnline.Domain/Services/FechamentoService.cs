using System;
using System.Linq;
using PontoOnline.Domain.Entities;

namespace PontoOnline.Domain.Services;

public class FechamentoService
{

    public const int ToleranciaExcessoMinutos = 10;

    public int CalcularMinutosTrabalhados(RegistroPonto ponto)
    {
        double minutosTrabalhados = 0;

        // Batidas com data inválida (ex.: 01/01/0001, gravada por um bug antigo) não entram na conta.
        static bool Ok(DateTime? d) => d.HasValue && d.Value.Year >= 2000;

        if (Ok(ponto.Entrada1) && Ok(ponto.SaidaAlmoco))
            minutosTrabalhados += Math.Max(0, (ponto.SaidaAlmoco!.Value - ponto.Entrada1!.Value).TotalMinutes);

        if (Ok(ponto.RetornoAlmoco) && Ok(ponto.Saida2))
            minutosTrabalhados += Math.Max(0, (ponto.Saida2!.Value - ponto.RetornoAlmoco!.Value).TotalMinutes);

        return (int)minutosTrabalhados;
    }

    // Minutos trabalhados acima da jornada em contratos que PROÍBEM hora extra (ex.: estágio).
    // Retorna 0 se o contrato permite hora extra ou se o excesso está dentro da tolerância.
    public int CalcularExcessoJornadaProibida(RegistroPonto ponto, int cargaHorariaMinutos, bool permiteHoraExtra)
    {
        if (permiteHoraExtra) return 0;

        int excesso = CalcularMinutosTrabalhados(ponto) - cargaHorariaMinutos;
        return excesso > ToleranciaExcessoMinutos ? excesso : 0;
    }

    public static string FormatarMinutos(int minutos)
    {
        return (minutos / 60) + "h" + (minutos % 60).ToString("D2");
    }

    public int CalcularSaldoDiario(RegistroPonto ponto, int cargaHorariaMinutos, bool permiteHoraExtra = true)
    {
        int saldo = CalcularMinutosTrabalhados(ponto) - cargaHorariaMinutos;

        if (!permiteHoraExtra && saldo > 0)
            saldo = 0;

        return saldo;
    }

    public int CalcularSaldoPeriodo(Usuario usuario, int cargaHorariaMinutos, DateTime inicio, DateTime fim, ISet<DateTime> feriados, bool permiteHoraExtra = true)
    {
        int saldo = 0;

        var registrosPorDia = usuario.RegistrosPonto
            .Where(r => r.DataRegistro.Date >= inicio.Date && r.DataRegistro.Date <= fim.Date)
            .GroupBy(r => r.DataRegistro.Date)
            .Select(g => g.OrderBy(r => r.PontoId).First());

        foreach (var registro in registrosPorDia)
            saldo += CalcularSaldoDiario(registro, cargaHorariaMinutos, permiteHoraExtra);

        for (var dia = inicio.Date; dia <= fim.Date; dia = dia.AddDays(1))
        {
            if (DiaGeraFalta(dia, usuario, feriados.Contains(dia)))
                saldo -= cargaHorariaMinutos;
        }

        return saldo;
    }

    public bool DiaGeraFalta(DateTime data, Usuario usuario, bool ehFeriado)
    {
        if (data.DayOfWeek == DayOfWeek.Saturday || data.DayOfWeek == DayOfWeek.Sunday || ehFeriado)
            return false;

        if (data.Date >= DateTime.Today)
            return false;

        var inicioVinculo = usuario.DataAdmissao.Date;
        if (usuario.RegistrosPonto.Any())
        {
            var primeiroPonto = usuario.RegistrosPonto.Min(r => r.DataRegistro.Date);
            if (primeiroPonto < inicioVinculo)
                inicioVinculo = primeiroPonto;
        }

        if (data.Date < inicioVinculo)
            return false;

        bool temAtestado = usuario.AusenciasJustificadas.Any(a => 
            a.Status == "Aprovado" && 
            data.Date >= a.DataInicio.Date && 
            data.Date <= a.DataFim.Date);

        if (temAtestado) return false;
        bool bateuPonto = usuario.RegistrosPonto.Any(r => r.DataRegistro.Date == data.Date);
        
        return !bateuPonto;
    }
}