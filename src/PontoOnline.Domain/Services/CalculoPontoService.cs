using PontoOnline.Domain.Entities;
namespace PontoOnline.Domain.Services;

public class CalculoPontoService
{
    private bool ValidarHorasPreenchidas (RegistroPonto r)
    {
        int preenchido = 0;
        if (r.Entrada1.HasValue) preenchido ++;
        if (r.SaidaAlmoco.HasValue) preenchido ++;
        if (r.RetornoAlmoco.HasValue) preenchido ++;
        if (r.Saida2.HasValue) preenchido ++;

        return preenchido == 4;
    }

    private bool ValidarOrdemCronologica (RegistroPonto r)
    {
        if(r.Entrada1 >= r.SaidaAlmoco) return false;
        if(r.SaidaAlmoco >= r.RetornoAlmoco) return false;
        if(r.RetornoAlmoco >= r.Saida2) return false;

        return true;
    }

    private int ObterMinutosTrabahados(RegistroPonto r)
    {
        var PeriodoManha = (r.SaidaAlmoco.Value - r.Entrada1.Value).TotalMinutes;
        var PeriodoTarde = (r.Saida2.Value - r.RetornoAlmoco.Value).TotalMinutes;

        return (int) (PeriodoManha + PeriodoTarde);
    }

    public int CalcularSaldoDiario(RegistroPonto registro, TipoContrato contrato)
    {
        if (!ValidarHorasPreenchidas(registro))
        {
            throw new InvalidOperationException("Marcação de pontos ímpares!");
            return 0;
        }

        if (!ValidarOrdemCronologica(registro))
        {
            throw new InvalidOperationException("ERRO: a ordem cronológica é inválida");
            return 0;
        }

        int MinutosTrabalhados = ObterMinutosTrabahados(registro);
        int SaldoBruto = MinutosTrabalhados - contrato.CargaHorariaDiariaMinutos;

        if (Math.Abs(SaldoBruto)<= 10)
        {
            SaldoBruto = 0;
        }

        if (!contrato.PermiteHoraExtra && SaldoBruto > 0)
        {
            SaldoBruto = 0;
        }

        return SaldoBruto;
    }
}