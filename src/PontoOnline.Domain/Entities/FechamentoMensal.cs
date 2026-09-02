namespace PontoOnline.Domain.Entities;

public class FechamentoMensal
{
    public int FechamentoId { get; set; }
    public string MesAno { get; set; } = string.Empty; 
    public int SaldoTotalMinutos { get; set; }
    public int IdUsuario { get; set; }

    public Usuario? Usuario { get; set; }
}