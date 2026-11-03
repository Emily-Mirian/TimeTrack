namespace PontoOnline.mvc.DTOs;
using Microsoft.AspNetCore.Http;

public class AtestadoRequestDto
{
    public int UsuarioId { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public IFormFile? Arquivo { get; set; }
}