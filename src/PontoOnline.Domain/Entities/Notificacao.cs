namespace PontoOnline.Domain.Entities;

public class Notificacao
{
    public int NotificacaoId { get; set; }
    public int UsuarioId { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public DateTime CriadaEm { get; set; } = DateTime.Now;
    public bool Lida { get; set; }

    public Usuario? Usuario { get; set; }
}
