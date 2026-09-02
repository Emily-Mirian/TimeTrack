namespace PontoOnline.Domain.Entities;

public class Usuario
{
    public int UsuarioId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string NivelAcesso { get; set; } = string.Empty;
    public int IdTipoContrato { get; set; }

    public TipoContrato? TipoContrato { get; set; }
    public ICollection<RegistroPonto> RegistrosPonto { get; set; } = new List<RegistroPonto>();
    public ICollection<AusenciaJustificada> AusenciasJustificadas { get; set; } = new List<AusenciaJustificada>();
    public ICollection<FechamentoMensal> FechamentosMensais { get; set; } = new List<FechamentoMensal>();
}