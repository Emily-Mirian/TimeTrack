using Microsoft.AspNetCore.Mvc;
using CsvHelper;
using System.Globalization;
using PontoOnline.API.Models; 

namespace PontoOnline.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        [HttpPost("csv")]
        public IActionResult ReceberPlanilhaCsv(IFormFile arquivo)
        {
            if (arquivo == null || arquivo.Length == 0)
            {
                return BadRequest("Nenhum arquivo foi enviado.");
            }

            var resultados = new List<object>();

            using (var stream = new StreamReader(arquivo.OpenReadStream()))
            using (var csv = new CsvReader(stream, CultureInfo.InvariantCulture))
            {
                var registros = csv.GetRecords<RegistroPontoCsv>().ToList();

                foreach (var registro in registros)
                {
                    TimeSpan horaEntrada = TimeSpan.Parse(registro.Entrada!);
                    TimeSpan horaSaida = TimeSpan.Parse(registro.Saida!);
                    TimeSpan horasTrabalhadasNoDia = horaSaida - horaEntrada;

                    resultados.Add(new 
                    {
                        Data = registro.Data,
                        Entrada = registro.Entrada,
                        Saida = registro.Saida,
                        TotalTrabalhado = horasTrabalhadasNoDia.ToString(@"hh\:mm")
                    });
                }
            }

            return Ok(new { 
                Mensagem = "CSV processado com sucesso!", 
                Registros = resultados 
            });
        }
    }
}