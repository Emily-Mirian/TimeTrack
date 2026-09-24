namespace PontoOnline.mvc.DTOs;

public class EditarPontoDto
{
    public int PontoId { get; set; }
    public DateTime? Entrada1 { get; set; }
    public DateTime? SaidaAlmoco { get; set; }
    public DateTime? RetornoAlmoco { get; set; }
    public DateTime? Saida2 { get; set; }
    public string Justificativa { get; set; } = string.Empty; 
}