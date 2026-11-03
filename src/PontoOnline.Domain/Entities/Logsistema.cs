using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PontoOnline.Domain.Entities
{
    [Table("logsistema")]
    public class LogSistema
    {
        [Key]
        [Column("LogId")]
        public int LogId { get; set; }

        [Required]
        [Column("DataHora")]
        public DateTime DataHora { get; set; } = DateTime.Now;

        [Required]
        [MaxLength(50)]
        [Column("Usuario")]
        public string Usuario { get; set; } = "sistema";

        [Required]
        [MaxLength(50)]
        [Column("Nivel")]
        public string Nivel { get; set; } = "baixa";

        [Required]
        [MaxLength(150)]
        [Column("Acao")]
        public string Acao { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("Modulo")]
        public string Modulo { get; set; } = string.Empty;

        [Column("Detalhes", TypeName = "text")]
        public string? Detalhes { get; set; }
    }
}