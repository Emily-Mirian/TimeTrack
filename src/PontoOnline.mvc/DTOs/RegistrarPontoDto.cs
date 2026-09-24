namespace PontoOnline.mvc.DTOs;

public class RegistrarPontoDto
{
    public string TipoMarcacao { get; set; } = string.Empty;
    public DateTime? DataHoraRegistro { get; set; }
}