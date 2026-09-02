namespace PontoOnline.Domain.Entities;

public class Feriado
{
    public int FeriadoId { get; set; }
    public DateTime Data { get; set; }
    public string Descricao { get; set; } = string.Empty;

    public ICollection<RegistroPonto> RegistrosPonto { get; set; } = new List<RegistroPonto>();
}