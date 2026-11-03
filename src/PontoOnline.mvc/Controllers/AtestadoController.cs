using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;
using PontoOnline.Infrastructure.Context;
using PontoOnline.mvc.DTOs;
using System;
using System.IO;
using System.Threading.Tasks;

namespace PontoOnline.mvc.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AtestadoController : Controller
{
    private readonly AppDbContext _context;
    private readonly LogService _logService;

    public AtestadoController(AppDbContext context, LogService logService)
    {
        _context = context;
        _logService = logService;
    }

    [HttpPost("enviar")]
    public async Task<IActionResult> EnviarAtestado([FromForm] AtestadoRequestDto dto)
    {
        try
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.UsuarioId == dto.UsuarioId);
            if (usuario == null) return NotFound(new { erro = "Usuário não encontrado." });

            if (dto.Arquivo != null && dto.Arquivo.Length > 0)
            {
                var pastaDestino = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "atestados");
                Directory.CreateDirectory(pastaDestino);

                string extensao = Path.GetExtension(dto.Arquivo.FileName).ToLower();
                string nomePadronizado = "atestado_" + dto.UsuarioId + "_" + dto.DataInicio.ToString("yyyyMMdd") + extensao;
                var caminhoArquivo = Path.Combine(pastaDestino, nomePadronizado);
                
                using (var stream = new FileStream(caminhoArquivo, FileMode.Create))
                {
                    await dto.Arquivo.CopyToAsync(stream);
                }
            }

            var ausencia = new AusenciaJustificada
            {
                IdUsuario = dto.UsuarioId,
                DataInicio = dto.DataInicio,
                DataFim = dto.DataFim,
                Motivo = dto.Motivo
            };

            _context.AusenciasJustificadas.Add(ausencia);
            await _context.SaveChangesAsync();

            // REGISTRA O LOG DE ENVIO DE ATESTADO
            await _logService.RegistrarAsync(
                acao: "Envio de Atestado Médico",
                modulo: "Atestados",
                detalhes: "Colaborador " + usuario.NomeCompleto + " enviou atestado de " + dto.DataInicio.ToString("dd/MM/yyyy") + " a " + dto.DataFim.ToString("dd/MM/yyyy"),
                usuario: usuario.NomeCompleto,
                nivel: "media"
            );

            return Ok(new { mensagem = "Atestado e documento enviados com sucesso!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
}