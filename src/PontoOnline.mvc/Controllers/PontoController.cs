using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;
using PontoOnline.Domain.Services;
using PontoOnline.Infrastructure.Context;
using PontoOnline.mvc.DTOs;

namespace PontoOnline.mvc.Controllers;

[Route("api/[controller]")]

public class PontoController : Controller
{
    private readonly AppDbContext _context;
    private readonly CalculoPontoService _calculoService;

    public PontoController(AppDbContext context, CalculoPontoService calculoService)
    {
        _context = context;
        _calculoService = calculoService;
    }

    [HttpPost("Registrar/{usuarioId}")]
    public async Task<IActionResult> Registrar(int usuarioId, [FromBody] RegistrarPontoDto dto)
    {
        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.TipoContrato)
                .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);

            if (usuario == null || usuario.TipoContrato == null)
            {
                return BadRequest("Usuário ou tipo de contrato não encontrado.");
            }

            if (usuario.EhAdminPuro)
                return BadRequest("O perfil Administrador não registra ponto.");

            var hoje = DateTime.Today;
            var registroPonto = await _context.RegistrosPonto
                .FirstOrDefaultAsync(r => r.IdUsuario == usuarioId && r.DataRegistro == hoje);

            if (registroPonto == null)
            {
                registroPonto = new RegistroPonto
                {
                    IdUsuario = usuarioId,
                    DataRegistro = hoje
                };
                _context.RegistrosPonto.Add(registroPonto);
            }

            var horarioMomento = dto.DataHoraRegistro ?? DateTime.Now;

            switch (dto.TipoMarcacao.ToLower().Trim())
            {
                case "entrada1":
                    registroPonto.Entrada1 = horarioMomento;
                    break;
                case "saidaalmoco":
                    registroPonto.SaidaAlmoco = horarioMomento;
                    break;
                case "retornoalmoco":
                    registroPonto.RetornoAlmoco = horarioMomento;
                    break;
                case "saida2":
                    registroPonto.Saida2 = horarioMomento;
                    break;
                default:
                    return BadRequest("Tipo de marcação inválido. Use: Entrada1, SaidaAlmoco, RetornoAlmoco ou Saida2.");
            }

            int saldoAtualizado = 0;
            try 
            {
                saldoAtualizado = _calculoService.CalcularSaldoDiario(registroPonto, usuario.TipoContrato);
                registroPonto.SaldoDiarioMinutos = saldoAtualizado;
            }
            catch (Exception)
            {
                saldoAtualizado = registroPonto.SaldoDiarioMinutos ?? 0;
            }

            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Ponto registrado com sucesso!", saldoAtual = saldoAtualizado });
        }
        catch (Exception ex)
        {

            return BadRequest(new { erro = ex.Message });
        }
    }
    [HttpPut("editar")]
    public async Task<IActionResult> EditarPonto([FromBody] EditarPontoDto dto)
    {
        try
        {
            var registroPonto = await _context.RegistrosPonto
                .Include(r => r.Usuario!)
                .ThenInclude(u => u.TipoContrato)
                .FirstOrDefaultAsync(r => r.PontoId == dto.PontoId);

            if (registroPonto == null)
            {
                return NotFound(new { erro = "Registro de ponto não encontrado." });
            }

            if (dto.Entrada1.HasValue) registroPonto.Entrada1 = dto.Entrada1;
            if (dto.SaidaAlmoco.HasValue) registroPonto.SaidaAlmoco = dto.SaidaAlmoco;
            if (dto.RetornoAlmoco.HasValue) registroPonto.RetornoAlmoco = dto.RetornoAlmoco;
            if (dto.Saida2.HasValue) registroPonto.Saida2 = dto.Saida2;

            if (registroPonto.Usuario?.TipoContrato != null)
            {
                int novoSaldo = _calculoService.CalcularSaldoDiario(registroPonto, registroPonto.Usuario.TipoContrato);
                registroPonto.SaldoDiarioMinutos = novoSaldo;
            }

            int usuarioResponsavelId = 1;
            
            var auditoria = new AuditoriaLog
            {
                DataHora = DateTime.Now,
                UsuarioResponsavelId = usuarioResponsavelId,
                Acao = "EdicaoManualPonto",
                Detalhes = $"Ponto ID {dto.PontoId} alterado pelo RH. Justificativa: {dto.Justificativa}"
            };

            _context.AuditoriaLogs.Add(auditoria);

            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Ponto editado com sucesso e log de auditoria gerado!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
    [HttpGet("extrato/{usuarioId}")]
    public async Task<IActionResult> ObterExtrato(int usuarioId, [FromQuery] DateTime? dataInicio, [FromQuery] DateTime? dataFim)
    {
        try
        {
            var query = _context.RegistrosPonto
                .Where(r => r.IdUsuario == usuarioId);

            if (dataInicio.HasValue)
            {
                query = query.Where(r => r.DataRegistro.Date >= dataInicio.Value.Date);
            }

            if (dataFim.HasValue)
            {
                query = query.Where(r => r.DataRegistro.Date <= dataFim.Value.Date);
            }

            var registros = await query
                .OrderBy(r => r.DataRegistro)
                .ToListAsync();

            int saldoTotalMinutos = registros.Sum(r => r.SaldoDiarioMinutos ?? 0);

            return Ok(new
            {
                usuarioId = usuarioId,
                totalDiasRegistrados = registros.Count,
                saldoTotalMinutos = saldoTotalMinutos,
                saldoTotalFormatado = $"{saldoTotalMinutos / 60}h {Math.Abs(saldoTotalMinutos % 60)}min",
                historico = registros
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpGet("status-atual/{usuarioId}")]
    public async Task<IActionResult> ObterStatusAtual(int usuarioId)
    {
        try
        {
            var hoje = DateTime.Today;

            var usuario = await _context.Usuarios
                .Include(u => u.TipoContrato)
                .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);

            if (usuario == null || usuario.TipoContrato == null)
                return NotFound(new { erro = "Usuário ou contrato não encontrado." });

            var inicioMes = new DateTime(hoje.Year, hoje.Month, 1);
            int diff = (7 + (hoje.DayOfWeek - DayOfWeek.Monday)) % 7;
            var inicioSemana = hoje.AddDays(-diff);

            var registrosMes = await _context.RegistrosPonto
                .Where(r => r.IdUsuario == usuarioId && r.DataRegistro.Date >= inicioMes)
                .ToListAsync();

            var registroPontoHoje = registrosMes.FirstOrDefault(r => r.DataRegistro.Date == hoje);
            int metaDiariaMinutos = usuario.TipoContrato.CargaHorariaDiariaMinutos;
            int minutosTrabalhadosHoje = 0;

            if (registroPontoHoje != null)
            {
                minutosTrabalhadosHoje = _calculoService.CalcularMinutosParciais(registroPontoHoje, DateTime.Now);
            }

            int minutosSemana = 0;
            int minutosMes = 0;

            foreach (var reg in registrosMes)
            {
                int minDia = 0;

                if (reg.DataRegistro.Date < hoje)
                {
                    minMinutoDia(reg, metaDiariaMinutos, out minDia);
                }

                else if (reg.DataRegistro.Date == hoje)
                {
                    minDia = minutosTrabalhadosHoje;
                }

                minutosMes += minDia;

                if (reg.DataRegistro.Date >= inicioSemana)
                {
                    minutosSemana += minDia;
                }
            }

            int minutosRestantes = metaDiariaMinutos - minutosTrabalhadosHoje;
            if (minutosRestantes < 0) minutosRestantes = 0;

            double percentual = metaDiariaMinutos > 0 ? (double)minutosTrabalhadosHoje / metaDiariaMinutos : 0;
            string statusCor = "verde";

            if (percentual >= 0.97) statusCor = "vermelho";
            else if (percentual >= 0.85) statusCor = "amarelo";

            return Ok(new
            {
                minutosTrabalhados = minutosTrabalhadosHoje,
                minutosRestantes = minutosRestantes,
                metaDiariaMinutos = metaDiariaMinutos,
                statusCor = statusCor,
                horasTrabalhadasFormatadas = $"{minutosTrabalhadosHoje / 60}h {minutosTrabalhadosHoje % 60}min",
                horasRestantesFormatadas = $"{minutosRestantes / 60}h {minutosRestantes % 60}min",
                
                semanaFormatada = $"{minutosSemana / 60}h {minutosSemana % 60}min",
                mesFormatada = $"{minutosMes / 60}h {minutosMes % 60}min",
                minutosSemanaNumerico = minutosSemana,
                minutosMesNumerico = minutosMes
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    private void minMinutoDia(RegistroPonto reg, int metaPadrao, out int totalMin)
    {
        totalMin = metaPadrao;
        if (reg.SaldoDiarioMinutos.HasValue)
        {
            totalMin = metaPadrao + reg.SaldoDiarioMinutos.Value;
        }
        else if (reg.Entrada1.HasValue && reg.Saida2.HasValue)
        {
            var manha = (reg.SaidaAlmoco ?? reg.Entrada1.Value) - reg.Entrada1.Value;
            var tarde = reg.Saida2.Value - (reg.RetornoAlmoco ?? reg.Saida2.Value);
            totalMin = (int)(manha.TotalMinutes + tarde.TotalMinutes);
        }
    }

    [HttpGet("resumo-dashboard/{usuarioId}")]
    public async Task<IActionResult> ObterResumoDashboard(int usuarioId)
    {
        try
        {
            var hoje = DateTime.Today;
            var inicioMes = new DateTime(hoje.Year, hoje.Month, 1);
            
            int diff = (7 + (hoje.DayOfWeek - DayOfWeek.Monday)) % 7;
            var inicioSemana = hoje.AddDays(-diff);

            var registrosMes = await _context.RegistrosPonto
                .Where(r => r.IdUsuario == usuarioId && r.DataRegistro.Date >= inicioMes)
                .OrderBy(r => r.DataRegistro)
                .ToListAsync();

            int minutosMes = registrosMes.Sum(r => r.SaldoDiarioMinutos ?? 0);

            int minutosSemana = registrosMes
                .Where(r => r.DataRegistro.Date >= inicioSemana)
                .Sum(r => r.SaldoDiarioMinutos ?? 0);

            var registroHoje = registrosMes.FirstOrDefault(r => r.DataRegistro.Date == hoje);
            int minutosHoje = 0;
            if (registroHoje != null)
            {
                minutosHoje = _calculoService.CalcularMinutosParciais(registroHoje, DateTime.Now);
            }

            return Ok(new
            {
                hojeStr = $"{minutosHoje / 60}h {minutosHoje % 60}min",
                semanaStr = $"{minutosSemana / 60}h {Math.Abs(minutosSemana % 60)}min",
                mesStr = $"{minutosMes / 60}h {Math.Abs(minutosMes % 60)}min"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
}
