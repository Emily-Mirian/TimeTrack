using System;
using System.Linq;
using PontoOnline.Domain.Entities;

namespace PontoOnline.Domain.Services;

public class FechamentoService
{

    public int CalcularSaldoDiario(RegistroPonto ponto, int cargaHorariaMinutos)
    {
        double minutosTrabalhados = 0;

        if (ponto.Entrada1.HasValue && ponto.SaidaAlmoco.HasValue)
            minutosTrabalhados += (ponto.SaidaAlmoco.Value - ponto.Entrada1.Value).TotalMinutes;

        if (ponto.RetornoAlmoco.HasValue && ponto.Saida2.HasValue)
            minutosTrabalhados += (ponto.Saida2.Value - ponto.RetornoAlmoco.Value).TotalMinutes;

        return (int)minutosTrabalhados - cargaHorariaMinutos;
    }

    public bool DiaGeraFalta(DateTime data, Usuario usuario, bool ehFeriado)
    {
        if (data.DayOfWeek == DayOfWeek.Saturday || data.DayOfWeek == DayOfWeek.Sunday || ehFeriado)
            return false;

        if (data.Date < usuario.DataAdmissao.Date)
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