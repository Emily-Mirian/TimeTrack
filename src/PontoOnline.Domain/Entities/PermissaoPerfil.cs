using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PontoOnline.Domain.Entities
{
    [Table("permissoesperfil")]
    public class PermissaoPerfil
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Funcao { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Perfil { get; set; } = string.Empty; // funcionario, rh, admin

        public bool Ativo { get; set; }
    }
}