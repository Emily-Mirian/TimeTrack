namespace PontoOnline.Domain.Entities;

public class RegistroPonto
{
    public int PontoId { get; set; }
    public DateTime DataRegistro { get; set; }
    public DateTime? Entrada1 { get; set; }
    public DateTime? SaidaAlmoco { get; set; }
    public DateTime? RetornoAlmoco { get; set; }
    public DateTime? Saida2 { get; set; }
    public int? SaldoDiarioMinutos { get; set; }
    public int IdUsuario { get; set; }
    public int? IdFeriado { get; set; }
    public bool AlertaLimiteEnviado { get; set; }

    public Usuario? Usuario { get; set; }
    public Feriado? Feriado { get; set; }
}