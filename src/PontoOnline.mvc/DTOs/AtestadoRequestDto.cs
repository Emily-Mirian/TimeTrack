namespace PontoOnline.API.DTOs;

public class AtestadoRequestDto
{
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string CaminhoArquivoComprovante { get; set; } = string.Empty; 
}