using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PontoOnline.Domain.Entities
{
    [Table("feriado")]
    public class Feriado
    {
        [Key]
        [Column("FeriadoId")]
        public int FeriadoId { get; set; }

        [Required]
        [Column("Data")]
        public DateTime Data { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("Descricao")]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("Tipo")]
        public string Tipo { get; set; } = "nacional";
    }
}