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
        if (!r.Entrada1.HasValue || !r.SaidaAlmoco.HasValue || !r.RetornoAlmoco.HasValue || !r.Saida2.HasValue)
        {
            return 0;
        }

        var PeriodoManha = (r.SaidaAlmoco.Value - r.Entrada1.Value).TotalMinutes;
        var PeriodoTarde = (r.Saida2.Value - r.RetornoAlmoco.Value).TotalMinutes;

        return (int) (PeriodoManha + PeriodoTarde);
    }

    public int CalcularMinutosParciais(RegistroPonto r, DateTime agora)
    {
        double minutosTotal = 0;

        if (r.Entrada1.HasValue)
        {
            var fimPeriodo1 = r.SaidaAlmoco ?? agora;
            if (fimPeriodo1 > r.Entrada1.Value)
            {
                minutosTotal += (fimPeriodo1 - r.Entrada1.Value).TotalMinutes;
            }
        }

        if (r.RetornoAlmoco.HasValue)
        {
            var fimPeriodo2 = r.Saida2 ?? agora;
            if (fimPeriodo2 > r.RetornoAlmoco.Value)
            {
                minutosTotal += (fimPeriodo2 - r.RetornoAlmoco.Value).TotalMinutes;
            }
        }

        return (int)minutosTotal;
    }

    public int CalcularSaldoDiario(RegistroPonto registro, TipoContrato contrato)
    {
        if (!ValidarHorasPreenchidas(registro))
        {
            throw new InvalidOperationException("Marcação de pontos ímpares!");
        }

        if (!ValidarOrdemCronologica(registro))
        {
            throw new InvalidOperationException("ERRO: a ordem cronológica é inválida");
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