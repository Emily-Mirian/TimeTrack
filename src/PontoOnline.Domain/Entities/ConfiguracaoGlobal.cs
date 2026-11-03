using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PontoOnline.Domain.Entities
{
    [Table("configuracoesglobais")]
    public class ConfiguracaoGlobal
    {
        [Key]
        public int Id { get; set; }

        public int ExpiracaoSessao { get; set; } = 30;
        public bool SenhaForte { get; set; } = true;
        public string FrequenciaBackup { get; set; } = "6h";
    }
}