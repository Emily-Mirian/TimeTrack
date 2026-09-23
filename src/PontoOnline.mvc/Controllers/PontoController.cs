using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;
using PontoOnline.Domain.Services;
using PontoOnline.Infrastructure.Context;
using PontoOnline.mvc.DTOs;

namespace PontoOnline.mvc.Controllers;

public class PontoController : Controller
{
    private readonly AppDbContext _context;
    private readonly CalculoPontoService _calculoService;

    public PontoController(AppDbContext context, CalculoPontoService calculoService)
    {
        _context = context;
        _calculoService = calculoService;
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] RegistrarPontoDto dto)
    {
        try
        {
            int usuarioId = 1; 

            var usuario = await _context.Usuarios
                .Include(u => u.TipoContrato)
                .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);

            if (usuario == null || usuario.TipoContrato == null)
            {
                return BadRequest("Usuário ou tipo de contrato não encontrado.");
            }

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

            int saldoCalculado = _calculoService.CalcularSaldoDiario(registroPonto, usuario.TipoContrato);
            registroPonto.SaldoDiarioMinutos = saldoCalculado;

            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Ponto registrado com sucesso!", saldoAtual = saldoCalculado });
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
                .Include(r => r.Usuario)
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
}