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

        // Controle de módulos (Visão Global). Padrão: tudo liberado para o RH.
        public bool ModuloImportacao { get; set; } = true;
        public bool ModuloExportacao { get; set; } = true;
        public bool ModuloEdicaoPonto { get; set; } = true;
        public bool ModuloAlertasJornada { get; set; } = true;
    }
}