namespace PontoOnline.Domain.Entities;

// Histórico permanente de importações (planilhas) e exportações (PDFs) feitas no sistema.
public class HistoricoArquivo
{
    [System.ComponentModel.DataAnnotations.Key]
    public int HistoricoId { get; set; }

    // "importacao" ou "exportacao"
    public string Tipo { get; set; } = string.Empty;

    public string NomeArquivo { get; set; } = string.Empty;
    public DateTime DataHora { get; set; } = DateTime.Now;
    public int? UsuarioId { get; set; }
    public string UsuarioNome { get; set; } = string.Empty;

    // "concluido" ou "erro"
    public string Status { get; set; } = "concluido";
    public int? Linhas { get; set; }
    public string? Detalhe { get; set; }

    // Parâmetros da exportação, para poder baixar o mesmo relatório de novo.
    public int? ColaboradorId { get; set; }
    public int? Ano { get; set; }
    public int? Mes { get; set; }
}
