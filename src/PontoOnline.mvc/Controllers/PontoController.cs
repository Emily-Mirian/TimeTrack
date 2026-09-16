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
}