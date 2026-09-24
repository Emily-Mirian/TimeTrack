using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;
using PontoOnline.Infrastructure.Context;
using PontoOnline.mvc.DTOs;

namespace PontoOnline.mvc.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AtestadoController : Controller
{
    private readonly AppDbContext _context;

    public AtestadoController(AppDbContext context)
    {
        _context = context;
    }
    [HttpPost("enviar")]
    public async Task<IActionResult> EnviarAtestado([FromBody] AtestadoRequestDto dto)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.UsuarioId == dto.UsuarioId);

            if (usuario == null)
            {
                return NotFound(new { erro = "Usuário não encontrado." });
            }

            var ausencia = new AusenciaJustificada
            {
                IdUsuario = dto.UsuarioId,
                DataInicio = dto.DataInicio,
                DataFim = dto.DataFim,
                Motivo = dto.Motivo,
            };

            _context.AusenciasJustificadas.Add(ausencia);
            await _context.SaveChangesAsync();
            return Ok(new { mensagem = "Atestado enviado com sucesso e aguardando validação do RH!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
}