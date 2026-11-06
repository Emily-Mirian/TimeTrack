using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Globalization;
using PontoOnline.Infrastructure.Context;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace PontoOnline.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelatoriosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogService _logService;

        public RelatoriosController(AppDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        [HttpGet("colaboradores")]
        public async Task<IActionResult> ListarColaboradores()
        {
            var colaboradores = await _context.Usuarios
                .Select(u => new { id = u.UsuarioId, nome = u.NomeCompleto })
                .ToListAsync();

            return Ok(colaboradores);
        }

        [HttpGet("saldo/{usuarioId}")]
        public async Task<IActionResult> ObterSaldo(int usuarioId)
        {
            var registros = await _context.RegistrosPonto
                .Where(r => r.IdUsuario == usuarioId && r.SaldoDiarioMinutos != null)
                .ToListAsync();

            int saldoTotal = registros.Sum(r => r.SaldoDiarioMinutos!.Value);
            bool positivo = saldoTotal >= 0;
            int absSaldo = Math.Abs(saldoTotal);

            return Ok(new
            {
                bancoHorasAtivo = true,
                saldo = (positivo ? "+" : "-") + (absSaldo / 60) + "h " + (absSaldo % 60).ToString("D2") + "min",
                positivo = positivo,
                atualizadoEm = DateTime.Now.ToString("dd/MM/yyyy")
            });
        }

        [HttpGet("meses/{usuarioId}")]
        public async Task<IActionResult> ObterMeses(int usuarioId)
        {
            var registros = await _context.RegistrosPonto
                .Where(r => r.IdUsuario == usuarioId)
                .Select(r => new { r.DataRegistro.Month, r.DataRegistro.Year })
                .Distinct()
                .OrderByDescending(r => r.Year)
                .ThenByDescending(r => r.Month)
                .ToListAsync();

            var meses = registros.Select(r => new
            {
                valor = r.Month,
                texto = new DateTime(r.Year, r.Month, 1).ToString("MMMM/yyyy", new CultureInfo("pt-BR"))
            });

            return Ok(meses);
        }

        [HttpGet("espelho/{usuarioId}/{anoMes}")] 
        public async Task<IActionResult> GerarRelatorioMensal(int usuarioId, string anoMes)
        {
            int ano = DateTime.Now.Year;
            int mes = 11;

            if (anoMes.Contains("/"))
            {
                var partes = anoMes.Split('/');
                int.TryParse(partes[0], out ano);
                int.TryParse(partes[1], out mes);
            }
            else
            {
                int.TryParse(anoMes, out mes);
            }
            var permissao = await _context.PermissoesPerfil
                .FirstOrDefaultAsync(p => p.Funcao == "exportacao" && p.Perfil == "rh");

            if (permissao != null && !permissao.Ativo)
            {
                await _logService.RegistrarAsync(
                    acao: "Acesso Negado - Exportação PDF",
                    modulo: "Segurança e Acessos",
                    detalhes: "Tentativa de exportar relatório em PDF bloqueada por falta de permissão.",
                    usuario: "RH",
                    nivel: "alta"
                );
                return StatusCode(403, new { erro = "Acesso negado: seu perfil não tem permissão para exportar relatórios." });
            }

            var usuario = await _context.Usuarios
                .Include(u => u.TipoContrato)
                .Include(u => u.AusenciasJustificadas)
                .Include(u => u.RegistrosPonto)
                .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);

            if (usuario == null)
            {
                return NotFound("Colaborador não encontrado.");
            }

            var feriados = await _context.Feriados
                .Where(f => f.Data.Year == ano && f.Data.Month == mes)
                .ToListAsync();

            var fechamentoService = new PontoOnline.Domain.Services.FechamentoService();
            int cargaHoraria = usuario.TipoContrato?.CargaHorariaDiariaMinutos ?? 480; 

            int totalDiasMes = DateTime.DaysInMonth(ano, mes);
            var diasDoMes = Enumerable.Range(1, totalDiasMes)
                .Select(d => new DateTime(ano, mes, d))
                .ToList();

            TimeSpan saldoMensalTotal = TimeSpan.Zero;

            var documentoPdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header().Column(col =>
                    {
                        col.Item().Text("TimeTrack - Relatório de Jornada").SemiBold().FontSize(20).FontColor(Colors.Blue.Darken2);
                        col.Item().Text("Colaborador: " + usuario.NomeCompleto).FontSize(14);
                        col.Item().Text("Período: " + mes.ToString("D2") + "/" + ano + " | Contrato: " + (usuario.TipoContrato?.Nome ?? "N/A")).FontSize(12);
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(1.5f); 
                            columns.RelativeColumn(); 
                            columns.RelativeColumn(); 
                            columns.RelativeColumn(); 
                            columns.RelativeColumn(); 
                            columns.RelativeColumn(1.2f); 
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Data").SemiBold();
                            header.Cell().Text("Entrada").SemiBold();
                            header.Cell().Text("S. Almoço").SemiBold();
                            header.Cell().Text("R. Almoço").SemiBold();
                            header.Cell().Text("Saída").SemiBold();
                            header.Cell().Text("Ocorrência / Saldo").SemiBold();
                        });

                        foreach (var dataDia in diasDoMes)
                        {
                            var registroPonto = usuario.RegistrosPonto
                                .FirstOrDefault(r => r.DataRegistro.Date == dataDia.Date);

                            bool ehFeriado = feriados.Any(f => f.Data.Date == dataDia.Date);
                            bool temAtestado = usuario.AusenciasJustificadas.Any(a => 
                                a.Status == "Aprovado" && dataDia.Date >= a.DataInicio.Date && dataDia.Date <= a.DataFim.Date);

                            table.Cell().Text(dataDia.ToString("dd/MM/yyyy"));

                            if (registroPonto != null)
                            {
                                int saldoMinutos = fechamentoService.CalcularSaldoDiario(registroPonto, cargaHoraria);
                                saldoMensalTotal = saldoMensalTotal.Add(TimeSpan.FromMinutes(saldoMinutos));

                                table.Cell().Text(registroPonto.Entrada1?.ToString("HH:mm") ?? "-");
                                table.Cell().Text(registroPonto.SaidaAlmoco?.ToString("HH:mm") ?? "-");
                                table.Cell().Text(registroPonto.RetornoAlmoco?.ToString("HH:mm") ?? "-");
                                table.Cell().Text(registroPonto.Saida2?.ToString("HH:mm") ?? "-");
                                
                                string textoSaldo = saldoMinutos >= 0 ? "+" + saldoMinutos + " min" : saldoMinutos + " min";
                                table.Cell().Text(textoSaldo).FontColor(saldoMinutos >= 0 ? Colors.Green.Darken2 : Colors.Red.Darken2);
                            }
                            else if (fechamentoService.DiaGeraFalta(dataDia, usuario, ehFeriado))
                            {
                                table.Cell().ColumnSpan(4).AlignCenter().Text("FALTA").FontColor(Colors.Red.Medium);
                                table.Cell().Text("Ausente").FontColor(Colors.Red.Medium);
                            }
                            else if (temAtestado)
                            {
                                table.Cell().ColumnSpan(4).AlignCenter().Text("ATESTADO MÉDICO APROVADO").FontColor(Colors.Orange.Darken2);
                                table.Cell().Text("Abonado");
                            }
                            else
                            {
                                string motivo = ehFeriado ? "Feriado" : (dataDia.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday ? "Fim de Semana" : "Não Aplicável");
                                table.Cell().ColumnSpan(4).AlignCenter().Text(motivo).FontColor(Colors.Grey.Medium);
                                table.Cell().Text("-");
                            }
                        }
                    });

                    page.Footer().Column(col => 
                    {
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        int totalMinutos = (int)saldoMensalTotal.TotalMinutes;
                        string sinal = totalMinutos < 0 ? "-" : "+";
                        col.Item().PaddingTop(5).Text("Banco de Horas do Mês: " + sinal + Math.Abs(totalMinutos / 60) + "h " + Math.Abs(totalMinutos % 60) + "m").SemiBold().FontSize(12);
                        col.Item().AlignCenter().Text(x => x.CurrentPageNumber());
                    });
                });
            });

            await _logService.RegistrarAsync(
                acao: "Geração de Espelho de Ponto (PDF)",
                modulo: "Relatórios",
                detalhes: "Relatório mensal gerado para o colaborador: " + usuario.NomeCompleto + " (" + mes.ToString("D2") + "/" + ano + ")",
                usuario: "Admin",
                nivel: "baixa"
            );

            var pdfBytes = documentoPdf.GeneratePdf();
            return File(pdfBytes, "application/pdf", "Relatorio_" + usuario.NomeCompleto.Replace(" ", "_") + "_" + mes + "_" + ano + ".pdf");
        }
    }
}
