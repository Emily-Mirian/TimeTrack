namespace PontoOnline.Domain.Entities;

public class TipoContrato
{
    public int ContratoId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int CargaHorariaDiariaMinutos { get; set; }
    public int CargaHorariaSemanaMinutos { get; set; }
    public bool PermiteHoraExtra { get; set; }

    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}