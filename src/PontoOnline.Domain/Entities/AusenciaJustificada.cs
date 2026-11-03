namespace PontoOnline.Domain.Entities;

public class AusenciaJustificada
{
    public int AusenciaId { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public int IdUsuario { get; set; }
    public string? Status { get; set; }

    public Usuario? Usuario { get; set; }
}