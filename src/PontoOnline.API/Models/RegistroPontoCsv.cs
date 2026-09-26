using CsvHelper.Configuration.Attributes;

namespace PontoOnline.API.Models
{
    public class RegistroPontoCsv
    {
        [Name("Data")]
        public string? Data { get; set; }

        [Name("Entrada")]
        public string? Entrada { get; set; }

        [Name("Saida")]
        public string? Saida { get; set; }
    }
}