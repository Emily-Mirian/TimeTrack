namespace PontoOnline.Domain.Entities;

public class AuditoriaLog
{
    public int LogId { get; set; }
    public DateTime DataHora { get; set; }
    public int UsuarioResponsavelId { get; set; } 
    public string Acao { get; set; } = string.Empty;
    public string Detalhes { get; set; } = string.Empty;

    public Usuario? UsuarioResponsavel { get; set; }
}