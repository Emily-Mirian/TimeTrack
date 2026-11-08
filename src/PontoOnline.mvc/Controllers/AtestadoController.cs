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
    private static readonly string[] ExtensoesPermitidas = { ".pdf", ".png", ".jpg", ".jpeg" };

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

            string extensao = string.Empty;
            bool temArquivo = dto.Arquivo != null && dto.Arquivo.Length > 0;
            if (temArquivo)
            {
                extensao = Path.GetExtension(dto.Arquivo!.FileName).ToLowerInvariant();
                if (!ExtensoesPermitidas.Contains(extensao))
                    return BadRequest(new { erro = "Formato não permitido. Envie PDF, PNG ou JPG." });
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

            if (temArquivo)
            {
                var pastaDestino = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "atestados");
                Directory.CreateDirectory(pastaDestino);

                // usuário + data + id do atestado + código aleatório: nunca se repete entre envios.
                string nomeUnico = "atestado_" + dto.UsuarioId + "_" + dto.DataInicio.ToString("yyyyMMdd") +
                    "_" + ausencia.AusenciaId + "_" + Guid.NewGuid().ToString("N").Substring(0, 8) + extensao;

                using (var stream = new FileStream(Path.Combine(pastaDestino, nomeUnico), FileMode.CreateNew))
                {
                    await dto.Arquivo!.CopyToAsync(stream);
                }

                ausencia.Anexo = nomeUnico;
                await _context.SaveChangesAsync();
            }

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
