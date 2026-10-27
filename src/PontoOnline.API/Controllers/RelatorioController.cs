using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Infrastructure.Context;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace PontoOnline.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelatorioController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RelatorioController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("pdf")]
        public async Task<IActionResult> GerarRelatorioMensal(
            [FromQuery] int mes, 
            [FromQuery] int ano, 
            [FromQuery] string nomeColaborador)
        {
            // 1. Busca os dados no Banco de Dados filtrando pelas propriedades DateTime
            var registros = await _context.RegistrosPonto
                .Where(r => r.DataRegistro.Year == ano && r.DataRegistro.Month == mes)
                .OrderBy(r => r.DataRegistro)
                .ToListAsync();

            if (!registros.Any())
            {
                return NotFound("Nenhum registro encontrado para este período.");
            }

            TimeSpan horasTrabalhadasNoMes = TimeSpan.Zero;

            // 2. Desenho do Documento PDF com QuestPDF
            var documentoPdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    // Cabeçalho
                    page.Header().Column(col =>
                    {
                        col.Item().Text("TimeTrack - Relatório de Jornada").SemiBold().FontSize(20).FontColor(Colors.Blue.Darken2);
                        col.Item().Text($"Colaborador: {nomeColaborador}").FontSize(14);
                        col.Item().Text($"Período: {mes:D2}/{ano}").FontSize(12);
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    // Corpo: Tabela Detalhada com 4 batidas
                    page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(1.5f); // Data
                            columns.RelativeColumn(); // Entrada 1
                            columns.RelativeColumn(); // Saída Almoço
                            columns.RelativeColumn(); // Retorno Almoço
                            columns.RelativeColumn(); // Saída 2
                            columns.RelativeColumn(); // Total do Dia
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Data").SemiBold();
                            header.Cell().Text("Entrada").SemiBold();
                            header.Cell().Text("S. Almoço").SemiBold();
                            header.Cell().Text("R. Almoço").SemiBold();
                            header.Cell().Text("Saída").SemiBold();
                            header.Cell().Text("Trabalhado").SemiBold();
                        });

                        foreach (var r in registros)
                        {
                            // Calcula as horas trabalhadas lidando com valores nulos de forma segura
                            TimeSpan turno1 = (r.SaidaAlmoco.HasValue && r.Entrada1.HasValue) 
                                ? r.SaidaAlmoco.Value.TimeOfDay - r.Entrada1.Value.TimeOfDay 
                                : TimeSpan.Zero;
                            
                            TimeSpan turno2 = (r.Saida2.HasValue && r.RetornoAlmoco.HasValue) 
                                ? r.Saida2.Value.TimeOfDay - r.RetornoAlmoco.Value.TimeOfDay 
                                : TimeSpan.Zero;

                            TimeSpan totalDia = turno1 + turno2;
                            horasTrabalhadasNoMes += totalDia;

                            table.Cell().Text(r.DataRegistro.ToString("dd/MM/yyyy"));
                            table.Cell().Text(r.Entrada1?.ToString("HH:mm") ?? "-");
                            table.Cell().Text(r.SaidaAlmoco?.ToString("HH:mm") ?? "-");
                            table.Cell().Text(r.RetornoAlmoco?.ToString("HH:mm") ?? "-");
                            table.Cell().Text(r.Saida2?.ToString("HH:mm") ?? "-");
                            table.Cell().Text(totalDia.ToString(@"hh\:mm"));
                        }
                    });

                    // Rodapé com o Saldo Final e Paginação
                    page.Footer().Column(col => 
                    {
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        // Formatação segura para passar de 24h sem zerar (ex: 180:30 horas)
                        int totalHorasInteiras = (int)Math.Floor(horasTrabalhadasNoMes.TotalHours);
                        col.Item().PaddingTop(5).Text($"Total de Horas Trabalhadas: {totalHorasInteiras:D2}:{horasTrabalhadasNoMes.Minutes:D2}").SemiBold().FontSize(12);
                        col.Item().AlignCenter().Text(x => x.CurrentPageNumber());
                    });
                });
            });

            // 3. Gera o arquivo e devolve
            var pdfBytes = documentoPdf.GeneratePdf();
            return File(pdfBytes, "application/pdf", $"Relatorio_{nomeColaborador}_{mes}_{ano}.pdf");
        }
    }
}