using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PontoOnline.Domain.Entities
{
    public class PreferenciaUsuario
    {
        [Key]
        public int PreferenciaId { get; set; }

        public int UsuarioId { get; set; }
        
        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }

        public bool AlertaEstagiario { get; set; } = true;
        public bool AlertaAtestado { get; set; } = true;
        public bool ResumoPendencias { get; set; } = true;
        public string FormatoExportacao { get; set; } = "pdf";
    }
}