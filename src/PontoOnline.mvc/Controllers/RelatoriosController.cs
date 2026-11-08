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
        private readonly PontoOnline.mvc.Services.ModulosService _modulos;

        public RelatoriosController(AppDbContext context, LogService logService, PontoOnline.mvc.Services.ModulosService modulos)
        {
            _context = context;
            _logService = logService;
            _modulos = modulos;
        }

        [HttpGet("colaboradores")]
        public async Task<IActionResult> ListarColaboradores()
        {
            // ADM puro não tem jornada: fica fora da lista de relatórios. Gestores/RH (que também são colaboradores) permanecem.
            var colaboradores = await _context.Usuarios
                .Where(u => (u.NivelAcesso ?? "").ToLower() != "admin")
                .Select(u => new { id = u.UsuarioId, nome = u.NomeCompleto })
                .ToListAsync();

            return Ok(colaboradores);
        }

        [HttpGet("saldo/{usuarioId}")]
        public async Task<IActionResult> ObterSaldo(int usuarioId)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.TipoContrato)
                .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);

            if (usuario == null) return NotFound("Colaborador não encontrado.");
            if (usuario.EhAdminPuro) return BadRequest("O perfil Administrador não possui jornada.");

            usuario.RegistrosPonto = await _context.RegistrosPonto
                .Where(r => r.IdUsuario == usuarioId)
                .ToListAsync();
            usuario.AusenciasJustificadas = await _context.AusenciasJustificadas
                .Where(a => a.IdUsuario == usuarioId)
                .ToListAsync();

            var feriadosTodos = (await _context.Feriados.Select(f => f.Data).ToListAsync())
                .Select(d => d.Date)
                .ToHashSet();

            var fechamentoService = new PontoOnline.Domain.Services.FechamentoService();
            int cargaHoraria = usuario.TipoContrato?.CargaHorariaDiariaMinutos ?? 480;

            bool permiteHoraExtra = usuario.TipoContrato?.PermiteHoraExtra ?? true;

            int saldoTotal = fechamentoService.CalcularSaldoPeriodo(
                usuario, cargaHoraria, DateTime.MinValue, DateTime.Today, feriadosTodos, permiteHoraExtra);
            int absSaldo = Math.Abs(saldoTotal);
            string sinal = saldoTotal > 0 ? "+" : (saldoTotal < 0 ? "-" : "");

            return Ok(new
            {
                bancoHorasAtivo = true,
                saldo = sinal + (absSaldo / 60) + "h " + (absSaldo % 60).ToString("D2") + "min",
                saldoMinutos = saldoTotal,
                positivo = saldoTotal >= 0,
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
                valor = r.Year + "-" + r.Month.ToString("D2"),
                texto = new DateTime(r.Year, r.Month, 1).ToString("MMMM/yyyy", new CultureInfo("pt-BR"))
            });

            return Ok(meses);
        }

        // Rota usada pelas telas: /espelho/{usuario}/{ano}/{mes}
        [HttpGet("espelho/{usuarioId}/{ano:int}/{mes:int}")]
        public Task<IActionResult> GerarRelatorioMensalAnoMes(int usuarioId, int ano, int mes, [FromQuery] int? solicitante = null)
            => GerarRelatorioMensal(usuarioId, ano + "/" + mes, solicitante);

        [HttpGet("espelho/{usuarioId}/{anoMes}")]
        public async Task<IActionResult> GerarRelatorioMensal(int usuarioId, string anoMes, [FromQuery] int? solicitante = null)
        {
            int ano = DateTime.Now.Year;
            int mes = DateTime.Now.Month;

            // Auditoria vinculada à identidade real de quem pediu o relatório (sem login genérico).
            var solicitanteUsuario = solicitante.HasValue
                ? await _context.Usuarios.FirstOrDefaultAsync(u => u.UsuarioId == solicitante.Value)
                : null;
            string autorLog = solicitanteUsuario?.NomeCompleto ?? "Não identificado";

            if (await _modulos.BloqueadoAsync(PontoOnline.mvc.Services.Modulos.Exportacao, solicitante, donoId: usuarioId))
            {
                await _logService.RegistrarAsync(
                    acao: "Acesso Negado - Exportação PDF",
                    modulo: "Controle de Módulos",
                    detalhes: "Exportação bloqueada: módulo desativado na Visão Global.",
                    usuario: autorLog,
                    nivel: "alta"
                );
                return StatusCode(403, new { erro = PontoOnline.mvc.Services.ModulosService.MensagemBloqueio(PontoOnline.mvc.Services.Modulos.Exportacao) });
            }

            anoMes = anoMes.Replace('-', '/');
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
                    usuario: autorLog,
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

            if (usuario.EhAdminPuro)
                return BadRequest("O perfil Administrador não possui jornada: espelho de ponto não se aplica.");

            var feriados = await _context.Feriados
                .Where(f => f.Data.Year == ano && f.Data.Month == mes)
                .ToListAsync();

            var fechamentoService = new PontoOnline.Domain.Services.FechamentoService();
            int cargaHoraria = usuario.TipoContrato?.CargaHorariaDiariaMinutos ?? 480;
            bool permiteHoraExtraPdf = usuario.TipoContrato?.PermiteHoraExtra ?? true;

            int totalDiasMes = DateTime.DaysInMonth(ano, mes);
            var diasDoMes = Enumerable.Range(1, totalDiasMes)
                .Select(d => new DateTime(ano, mes, d))
                .ToList();

            TimeSpan saldoMensalTotal = TimeSpan.Zero;
            int totalExcessoMin = 0;
            int qtdDiasExcesso = 0;

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
                                .Where(r => r.DataRegistro.Date == dataDia.Date)
                                .OrderBy(r => r.PontoId)
                                .FirstOrDefault();

                            bool ehFeriado = feriados.Any(f => f.Data.Date == dataDia.Date);
                            bool temAtestado = usuario.AusenciasJustificadas.Any(a => 
                                a.Status == "Aprovado" && dataDia.Date >= a.DataInicio.Date && dataDia.Date <= a.DataFim.Date);

                            table.Cell().Text(dataDia.ToString("dd/MM/yyyy"));

                            if (registroPonto != null)
                            {
                                int saldoMinutos = fechamentoService.CalcularSaldoDiario(registroPonto, cargaHoraria, permiteHoraExtraPdf);
                                saldoMensalTotal = saldoMensalTotal.Add(TimeSpan.FromMinutes(saldoMinutos));

                                table.Cell().Text(registroPonto.Entrada1?.ToString("HH:mm") ?? "-");
                                table.Cell().Text(registroPonto.SaidaAlmoco?.ToString("HH:mm") ?? "-");
                                table.Cell().Text(registroPonto.RetornoAlmoco?.ToString("HH:mm") ?? "-");
                                table.Cell().Text(registroPonto.Saida2?.ToString("HH:mm") ?? "-");
                                
                                int excessoMin = fechamentoService.CalcularExcessoJornadaProibida(registroPonto, cargaHoraria, permiteHoraExtraPdf);
                                if (excessoMin > 0)
                                {
                                    totalExcessoMin += excessoMin;
                                    qtdDiasExcesso++;
                                    table.Cell().Column(c =>
                                    {
                                        c.Item().Text("+0 min (sem banco)").FontColor(Colors.Grey.Darken1);
                                        c.Item().Text("EXCESSO DE JORNADA: " + PontoOnline.Domain.Services.FechamentoService.FormatarMinutos(excessoMin) + " acima do limite")
                                            .Bold().FontSize(8).FontColor(Colors.Red.Darken2);
                                    });
                                }
                                else
                                {
                                    string textoSaldo = saldoMinutos >= 0 ? "+" + saldoMinutos + " min" : saldoMinutos + " min";
                                    table.Cell().Text(textoSaldo).FontColor(saldoMinutos >= 0 ? Colors.Green.Darken2 : Colors.Red.Darken2);
                                }
                            }
                            else if (fechamentoService.DiaGeraFalta(dataDia, usuario, ehFeriado))
                            {
                                table.Cell().ColumnSpan(4).AlignCenter().Text("FALTA").FontColor(Colors.Red.Medium);
                                saldoMensalTotal = saldoMensalTotal.Subtract(TimeSpan.FromMinutes(cargaHoraria));
                                table.Cell().Text("Ausente -" + cargaHoraria + " min").FontColor(Colors.Red.Medium);
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
                        if (qtdDiasExcesso > 0)
                        {
                            col.Item().PaddingTop(3).Text("ATENÇÃO: " + qtdDiasExcesso + " dia(s) com excesso de jornada (" +
                                PontoOnline.Domain.Services.FechamentoService.FormatarMinutos(totalExcessoMin) +
                                " no total), proibido para o contrato " + (usuario.TipoContrato?.Nome ?? "N/A") + ". Horas não computadas no banco.")
                                .Bold().FontSize(9).FontColor(Colors.Red.Darken2);
                        }
                        col.Item().AlignCenter().Text(x => x.CurrentPageNumber());
                    });
                });
            });

            await _logService.RegistrarAsync(
                acao: "Geração de Espelho de Ponto (PDF)",
                modulo: "Relatórios",
                detalhes: "Relatório mensal gerado para o colaborador: " + usuario.NomeCompleto + " (" + mes.ToString("D2") + "/" + ano + ")",
                usuario: autorLog,
                nivel: "baixa"
            );

            var pdfBytes = documentoPdf.GeneratePdf();
            string nomePdf = "Relatorio_" + usuario.NomeCompleto.Replace(" ", "_") + "_" + mes + "_" + ano + ".pdf";

            try
            {
                _context.HistoricoArquivos.Add(new PontoOnline.Domain.Entities.HistoricoArquivo
                {
                    Tipo = "exportacao",
                    NomeArquivo = nomePdf,
                    DataHora = DateTime.Now,
                    UsuarioId = solicitanteUsuario?.UsuarioId,
                    UsuarioNome = solicitanteUsuario?.NomeCompleto ?? "Não identificado",
                    Status = "concluido",
                    Detalhe = "Espelho de ponto de " + usuario.NomeCompleto + " (" + mes.ToString("D2") + "/" + ano + ")",
                    ColaboradorId = usuarioId,
                    Ano = ano,
                    Mes = mes
                });
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("[HISTORICO] Falha ao registrar exportação: " + ex.Message);
            }

            return File(pdfBytes, "application/pdf", nomePdf);
        }
    }
}
