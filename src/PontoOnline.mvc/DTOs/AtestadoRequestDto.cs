namespace PontoOnline.mvc.DTOs;

public class AtestadoRequestDto
{
    public int UsuarioId { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? CaminhoArquivoComprovante { get; set; } = string.Empty; 
}