namespace PontoOnline.Domain.Entities;

public class Usuario
{
    public int UsuarioId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string NivelAcesso { get; set; } = string.Empty;
    public int IdTipoContrato { get; set; }
    public DateTime DataAdmissao { get; set; }
    public string? Departamento { get; set; }

    // ADM puro (dono do negócio): não bate ponto, não tem jornada e fica fora dos relatórios de espelho/faltas.
    // Colaboradores com perfil de gestão/RH NÃO entram aqui: são colaboradores e batem o próprio ponto.
    public bool EhAdminPuro => string.Equals(NivelAcesso, "admin", StringComparison.OrdinalIgnoreCase);

    public TipoContrato? TipoContrato { get; set; }
    public ICollection<RegistroPonto> RegistrosPonto { get; set; } = new List<RegistroPonto>();
    public ICollection<AusenciaJustificada> AusenciasJustificadas { get; set; } = new List<AusenciaJustificada>();
    public ICollection<FechamentoMensal> FechamentosMensais { get; set; } = new List<FechamentoMensal>();
}