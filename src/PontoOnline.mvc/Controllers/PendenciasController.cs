using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using PontoOnline.Infrastructure.Context;
using PontoOnline.Domain.Entities;

namespace PontoOnline.mvc.Controllers 
{
    [Route("api/[controller]")]
    [ApiController]
    public class PendenciasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogService _logService;
        private readonly PontoOnline.mvc.Services.NotificacaoService _notificacoes;
        private readonly PontoOnline.Domain.Services.CalculoPontoService _calculoService;
        private readonly PontoOnline.mvc.Services.ModulosService _modulos;

        public PendenciasController(AppDbContext context, LogService logService, PontoOnline.mvc.Services.NotificacaoService notificacoes, PontoOnline.Domain.Services.CalculoPontoService calculoService, PontoOnline.mvc.Services.ModulosService modulos)
        {
            _modulos = modulos;
            _context = context;
            _logService = logService;
            _notificacoes = notificacoes;
            _calculoService = calculoService;
        }

        [HttpGet]
        public async Task<IActionResult> ObterPendencias()
        {
            var pendencias = new List<object>();

            var atestados = await _context.AusenciasJustificadas
                .Include(a => a.Usuario)
                .ThenInclude(u => u!.TipoContrato)
                .Where(a => a.Status == "Pendente" || a.Status == null)
                .ToListAsync();

            foreach (var a in atestados)
            {
                string? anexoUrl = null;

                if (!string.IsNullOrEmpty(a.Anexo))
                {
                    // Atestados novos: o nome exato do arquivo está gravado no próprio registro.
                    anexoUrl = "/uploads/atestados/" + Uri.EscapeDataString(a.Anexo);
                }
                else
                {
                    // Atestados antigos (antes da correção): nome pelo padrão usuário + data de início.
                    int idDoUsuario = a.Usuario?.UsuarioId ?? 0;
                    string nomeBase = "atestado_" + idDoUsuario + "_" + a.DataInicio.ToString("yyyyMMdd");
                    string pasta = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "atestados");

                    foreach (var ext in new[] { ".png", ".jpg", ".jpeg", ".pdf" })
                    {
                        if (System.IO.File.Exists(Path.Combine(pasta, nomeBase + ext)))
                        {
                            anexoUrl = "/uploads/atestados/" + nomeBase + ext;
                            break;
                        }
                    }
                }

                pendencias.Add(new
                {
                    id = "atestado_" + a.AusenciaId, 
                    colaborador = a.Usuario?.NomeCompleto ?? "Colaborador",
                    contrato = a.Usuario?.TipoContrato?.Nome ?? "N/A",
                    data = a.DataInicio.ToString("dd/MM/yyyy"),
                    tipo = "atestado",
                    detalhe = "Atestado de " + a.DataInicio.ToString("dd/MM") + " a " + a.DataFim.ToString("dd/MM"),
                    anexoUrl = anexoUrl
                });
            }

            var hoje = DateTime.Today;
            var registrosPassados = await _context.RegistrosPonto
                .Include(r => r.Usuario)
                .ThenInclude(u => u!.TipoContrato)
                .Where(r => r.DataRegistro < hoje)
                .ToListAsync();

            // Incompleto = qualquer uma das 4 batidas ausente (ou gravada com data inválida, ex.: 01/01/0001).
            foreach (var b in registrosPassados.Where(r => FaltandoBatidas(r).Count > 0))
            {
                var faltando = FaltandoBatidas(b);
                pendencias.Add(new
                {
                    id = "ponto_" + b.PontoId,
                    colaborador = b.Usuario?.NomeCompleto ?? "Colaborador",
                    contrato = b.Usuario?.TipoContrato?.Nome ?? "N/A",
                    data = b.DataRegistro.ToString("dd/MM/yyyy"),
                    tipo = "batida_impar",
                    detalhe = "Batida incompleta (faltam: " + string.Join(", ", faltando) + ")",
                    batidas = new
                    {
                        entrada1 = HoraOuNull(b.Entrada1),
                        saidaAlmoco = HoraOuNull(b.SaidaAlmoco),
                        retornoAlmoco = HoraOuNull(b.RetornoAlmoco),
                        saida2 = HoraOuNull(b.Saida2)
                    }
                });
            }

            var fechamento = new PontoOnline.Domain.Services.FechamentoService();
            var registrosContratoRestrito = await _context.RegistrosPonto
                .Include(r => r.Usuario)
                .ThenInclude(u => u!.TipoContrato)
                .Where(r => r.Saida2 != null && r.Usuario!.TipoContrato != null && !r.Usuario.TipoContrato.PermiteHoraExtra)
                .ToListAsync();
            registrosContratoRestrito = registrosContratoRestrito.Where(r => FaltandoBatidas(r).Count == 0).ToList();

            var marcadoresTratados = await _context.AuditoriaLogs
                .Where(l => l.Acao == "tratamento_excesso_jornada")
                .Select(l => l.Detalhes)
                .ToListAsync();

            foreach (var r in registrosContratoRestrito)
            {
                if (marcadoresTratados.Any(d => d != null && d.Contains("[PONTO:" + r.PontoId + "]")))
                    continue;

                var contrato = r.Usuario!.TipoContrato!;
                int excesso = fechamento.CalcularExcessoJornadaProibida(r, contrato.CargaHorariaDiariaMinutos, contrato.PermiteHoraExtra);
                if (excesso <= 0) continue;

                int trabalhado = fechamento.CalcularMinutosTrabalhados(r);
                pendencias.Add(new
                {
                    id = "excesso_" + r.PontoId,
                    colaborador = r.Usuario.NomeCompleto ?? "Colaborador",
                    contrato = contrato.Nome,
                    data = r.DataRegistro.ToString("dd/MM/yyyy"),
                    tipo = "excesso_jornada",
                    detalhe = "Excesso de jornada no contrato " + contrato.Nome + ": " +
                        PontoOnline.Domain.Services.FechamentoService.FormatarMinutos(trabalhado) + " trabalhadas (limite " +
                        PontoOnline.Domain.Services.FechamentoService.FormatarMinutos(contrato.CargaHorariaDiariaMinutos) + "), " +
                        PontoOnline.Domain.Services.FechamentoService.FormatarMinutos(excesso) + " a mais. Não computado no banco de horas."
                });
            }

            return Ok(pendencias);
        }

        private static bool BatidaValida(DateTime? d) => d.HasValue && d.Value.Year >= 2000;

        private static string? HoraOuNull(DateTime? d) => BatidaValida(d) ? d!.Value.ToString("HH:mm") : null;

        private static List<string> FaltandoBatidas(RegistroPonto r)
        {
            var faltando = new List<string>();
            if (!BatidaValida(r.Entrada1)) faltando.Add("Entrada");
            if (!BatidaValida(r.SaidaAlmoco)) faltando.Add("Saída Almoço");
            if (!BatidaValida(r.RetornoAlmoco)) faltando.Add("Retorno Almoço");
            if (!BatidaValida(r.Saida2)) faltando.Add("Saída");
            return faltando;
        }

        private static bool TentarMontar(DateTime dia, string? hhmm, out DateTime resultado)
        {
            resultado = default;
            if (string.IsNullOrWhiteSpace(hhmm) || !TimeSpan.TryParse(hhmm, out var hora)) return false;
            if (hora < TimeSpan.Zero || hora >= TimeSpan.FromHours(24)) return false;
            resultado = dia.Date + new TimeSpan(hora.Hours, hora.Minutes, 0);
            return true;
        }

        [HttpPut("ponto/{id}/resolver")]
        public async Task<IActionResult> ResolverBatidaImpar(int id, [FromBody] ResolverPontoDto dto)
        {
            try
            {
                if (await _modulos.BloqueadoAsync(PontoOnline.mvc.Services.Modulos.EdicaoPonto, dto.UsuarioResponsavelId > 0 ? dto.UsuarioResponsavelId : null))
                {
                    await _logService.RegistrarAsync(
                        acao: "Tentativa de Ação Bloqueada",
                        modulo: "Controle de Módulos",
                        detalhes: "Edição de ponto bloqueada: módulo desativado na Visão Global.",
                        usuario: "RH",
                        nivel: "alta"
                    );
                    return StatusCode(403, new { erro = PontoOnline.mvc.Services.ModulosService.MensagemBloqueio(PontoOnline.mvc.Services.Modulos.EdicaoPonto) });
                }

                var registro = await _context.RegistrosPonto
                    .Include(r => r.Usuario)
                    .ThenInclude(u => u!.TipoContrato)
                    .FirstOrDefaultAsync(r => r.PontoId == id);

                if (registro == null)
                    return NotFound(new { erro = "Registro de ponto não encontrado." });

                if (string.IsNullOrWhiteSpace(dto.Justificativa) || dto.Justificativa.Trim().Length < 10)
                    return BadRequest(new { erro = "Informe uma justificativa com pelo menos 10 caracteres." });

                var antes = new[] { registro.Entrada1, registro.SaidaAlmoco, registro.RetornoAlmoco, registro.Saida2 };

                var dia = registro.DataRegistro.Date;
                var informados = new (string Nome, string? Valor)[]
                {
                    ("Entrada", dto.Entrada1), ("Saída Almoço", dto.SaidaAlmoco),
                    ("Retorno Almoço", dto.RetornoAlmoco), ("Saída", dto.Saida2)
                };
                var novos = new DateTime[4];
                for (int i = 0; i < 4; i++)
                {
                    if (!TentarMontar(dia, informados[i].Valor, out novos[i]))
                        return BadRequest(new { erro = "Horário inválido ou não informado: " + informados[i].Nome + "." });
                }

                for (int i = 1; i < 4; i++)
                {
                    if (novos[i] <= novos[i - 1])
                        return BadRequest(new { erro = informados[i].Nome + " deve ser depois de " + informados[i - 1].Nome + "." });
                }

                registro.Entrada1 = novos[0];
                registro.SaidaAlmoco = novos[1];
                registro.RetornoAlmoco = novos[2];
                registro.Saida2 = novos[3];

                if (registro.Usuario?.TipoContrato != null)
                    registro.SaldoDiarioMinutos = _calculoService.CalcularSaldoDiario(registro, registro.Usuario.TipoContrato);

                int autorId = dto.UsuarioResponsavelId > 0 ? dto.UsuarioResponsavelId : 3;
                string nomeColab = registro.Usuario?.NomeCompleto ?? "Colaborador";

                string Fmt(DateTime? d) => BatidaValida(d) ? d!.Value.ToString("HH:mm") : "—";
                string alteracoes = string.Join("; ", new[] { "Entrada", "Saída Almoço", "Retorno Almoço", "Saída" }
                    .Select((nome, i) => nome + ": " + Fmt(antes[i]) + " → " + novos[i].ToString("HH:mm")));

                var logAuditoria = new AuditoriaLog
                {
                    DataHora = DateTime.Now,
                    UsuarioResponsavelId = autorId,
                    Acao = "edicao_ponto",
                    Detalhes = "Batidas de <strong>" + nomeColab + "</strong> (Data: " + registro.DataRegistro.ToString("dd/MM/yyyy") + ") corrigidas. " +
                        alteracoes + ". Justificativa: " + dto.Justificativa.Trim()
                };

                _context.AuditoriaLogs.Add(logAuditoria);

                await _notificacoes.NotificarDecisaoAsync(registro.IdUsuario, "batida_corrigida",
                    "O RH corrigiu suas batidas do dia " + registro.DataRegistro.ToString("dd/MM/yyyy") + ".");

                await _context.SaveChangesAsync();

                await _logService.RegistrarAsync(
                    acao: "Resolução de Batida Ímpar",
                    modulo: "Pendências",
                    detalhes: "Ponto corrigido para o colaborador: " + nomeColab,
                    usuario: "Admin",
                    nivel: "media"
                );

                return Ok(new { mensagem = "Batida de ponto resolvida e salva com sucesso!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message, detalhe = ex.InnerException?.Message });
            }
        }
        
        [HttpPut("atestado/{id}/aprovar")]
        public async Task<IActionResult> AprovarAtestado(int id, [FromBody] ValidarAtestadoDto dto)
        {
            try
            {
                var permissaoAtiva = await _context.PermissoesPerfil
                    .FirstOrDefaultAsync(p => p.Funcao == "aprovar_atestados" && p.Perfil == "rh");

                if (permissaoAtiva != null && !permissaoAtiva.Ativo)
                {
                    await _logService.RegistrarAsync(
                        acao: "Tentativa de Ação Bloqueada",
                        modulo: "Segurança e Acessos",
                        detalhes: "O perfil de RH tentou aprovar um atestado, mas a permissão está desativada.",
                        usuario: "Admin",
                        nivel: "alta"
                    );

                    return StatusCode(403, new { erro = "Acesso negado: este perfil não tem permissão para aprovar atestados." });
                }

                var atestado = await _context.AusenciasJustificadas
                    .Include(a => a.Usuario)
                    .FirstOrDefaultAsync(a => a.AusenciaId == id); 

                if (atestado == null) 
                    return NotFound(new { erro = "Atestado não encontrado." });

                atestado.Status = "Aprovado";

                await _notificacoes.NotificarDecisaoAsync(atestado.IdUsuario, "atestado_aprovado",
                    "Seu atestado de " + atestado.DataInicio.ToString("dd/MM/yyyy") + " a " + atestado.DataFim.ToString("dd/MM/yyyy") +
                    " foi VALIDADO pelo RH. Os dias foram abonados.");

                int autorId = dto.UsuarioResponsavelId > 0 ? dto.UsuarioResponsavelId : 3;
                string nomeColab = atestado.Usuario?.NomeCompleto ?? "Colaborador";

                _context.AuditoriaLogs.Add(new AuditoriaLog
                {
                    DataHora = DateTime.Now,
                    UsuarioResponsavelId = autorId,
                    Acao = "aprovacao_atestado",
                    Detalhes = "Atestado de <strong>" + nomeColab + "</strong> (" + atestado.DataInicio.ToString("dd/MM/yyyy") + " a " + atestado.DataFim.ToString("dd/MM/yyyy") + ") validado pelo RH."
                });

                await _context.SaveChangesAsync();

                await _logService.RegistrarAsync(
                    acao: "Aprovação de Atestado",
                    modulo: "Pendências",
                    detalhes: "Atestado aprovado para o colaborador: " + nomeColab,
                    usuario: "Admin",
                    nivel: "media"
                );

                return Ok(new { mensagem = "Atestado aprovado com sucesso!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }

        [HttpPut("atestado/{id}/rejeitar")]
        public async Task<IActionResult> RejeitarAtestado(int id, [FromBody] ValidarAtestadoDto dto)
        {
            try
            {
                var permissaoAtiva = await _context.PermissoesPerfil
                    .FirstOrDefaultAsync(p => p.Funcao == "aprovar_atestados" && p.Perfil == "rh");

                if (permissaoAtiva != null && !permissaoAtiva.Ativo)
                {
                    await _logService.RegistrarAsync(
                        acao: "Tentativa de Ação Bloqueada",
                        modulo: "Segurança e Acessos",
                        detalhes: "O perfil de RH tentou rejeitar um atestado, mas a permissão está desativada.",
                        usuario: "Admin",
                        nivel: "alta"
                    );

                    return StatusCode(403, new { erro = "Acesso negado: este perfil não tem permissão para validar atestados." });
                }

                var atestado = await _context.AusenciasJustificadas
                    .Include(a => a.Usuario)
                    .FirstOrDefaultAsync(a => a.AusenciaId == id);

                if (atestado == null)
                    return NotFound(new { erro = "Atestado não encontrado." });

                atestado.Status = "Rejeitado";

                await _notificacoes.NotificarDecisaoAsync(atestado.IdUsuario, "atestado_rejeitado",
                    "Seu atestado de " + atestado.DataInicio.ToString("dd/MM/yyyy") + " a " + atestado.DataFim.ToString("dd/MM/yyyy") +
                    " foi REJEITADO pelo RH. Os dias não foram abonados. Procure o RH em caso de dúvida.");

                int autorId = dto.UsuarioResponsavelId > 0 ? dto.UsuarioResponsavelId : 3;
                string nomeColab = atestado.Usuario?.NomeCompleto ?? "Colaborador";

                _context.AuditoriaLogs.Add(new AuditoriaLog
                {
                    DataHora = DateTime.Now,
                    UsuarioResponsavelId = autorId,
                    Acao = "rejeicao_atestado",
                    Detalhes = "Atestado de <strong>" + nomeColab + "</strong> (" + atestado.DataInicio.ToString("dd/MM/yyyy") + " a " + atestado.DataFim.ToString("dd/MM/yyyy") + ") rejeitado pelo RH."
                });

                await _context.SaveChangesAsync();

                await _logService.RegistrarAsync(
                    acao: "Rejeição de Atestado",
                    modulo: "Pendências",
                    detalhes: "Atestado rejeitado para o colaborador: " + nomeColab,
                    usuario: "Admin",
                    nivel: "media"
                );

                return Ok(new { mensagem = "Atestado rejeitado." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }

        [HttpPut("excesso/{pontoId}/tratar")]
        public async Task<IActionResult> TratarExcessoJornada(int pontoId, [FromBody] TratarExcessoDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Justificativa))
                    return BadRequest(new { erro = "Informe a justificativa/providência adotada." });

                var registro = await _context.RegistrosPonto
                    .Include(r => r.Usuario)
                    .ThenInclude(u => u!.TipoContrato)
                    .FirstOrDefaultAsync(r => r.PontoId == pontoId);

                if (registro == null)
                    return NotFound(new { erro = "Registro de ponto não encontrado." });

                var fechamento = new PontoOnline.Domain.Services.FechamentoService();
                int trabalhado = fechamento.CalcularMinutosTrabalhados(registro);
                string nomeColab = registro.Usuario?.NomeCompleto ?? "Colaborador";
                int autorId = dto.UsuarioResponsavelId > 0 ? dto.UsuarioResponsavelId : 3;

                _context.AuditoriaLogs.Add(new AuditoriaLog
                {
                    DataHora = DateTime.Now,
                    UsuarioResponsavelId = autorId,
                    Acao = "tratamento_excesso_jornada",
                    Detalhes = "[PONTO:" + pontoId + "] Excesso de jornada de <strong>" + nomeColab + "</strong> (" +
                        registro.DataRegistro.ToString("dd/MM/yyyy") + ", " +
                        PontoOnline.Domain.Services.FechamentoService.FormatarMinutos(trabalhado) +
                        " trabalhadas) verificado e tratado pelo RH. Providência: " + dto.Justificativa.Trim()
                });

                await _context.SaveChangesAsync();

                await _logService.RegistrarAsync(
                    acao: "Tratamento de Excesso de Jornada",
                    modulo: "Pendências",
                    detalhes: "Excesso de jornada de " + nomeColab + " em " + registro.DataRegistro.ToString("dd/MM/yyyy") + " tratado. Providência: " + dto.Justificativa.Trim(),
                    usuario: "Admin",
                    nivel: "alta"
                );

                return Ok(new { mensagem = "Ocorrência tratada e registrada na auditoria." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }

        public class TratarExcessoDto
        {
            public int UsuarioResponsavelId { get; set; }
            public string Justificativa { get; set; } = string.Empty;
        }

        public class ValidarAtestadoDto
        {
            public int UsuarioResponsavelId { get; set; }
        }

        public class ResolverPontoDto
        {
            public string? Entrada1 { get; set; }
            public string? SaidaAlmoco { get; set; }
            public string? RetornoAlmoco { get; set; }
            public string? Saida2 { get; set; }
            public string Justificativa { get; set; } = string.Empty;
            public int UsuarioResponsavelId { get; set; }
        }
    }
}
