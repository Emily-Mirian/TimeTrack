using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using PontoOnline.Infrastructure.Context;
using PontoOnline.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/me")]
    [ApiController]
    public class ConfiguracoesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogService _logService;

        public ConfiguracoesController(AppDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> ObterMeusDados(int usuarioId)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.TipoContrato)
                .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);

            if (usuario == null) return NotFound(new { erro = "Usuário não encontrado." });

            return Ok(new
            {
                nome = usuario.NomeCompleto,
                email = usuario.Email,
                contrato = usuario.TipoContrato?.Nome ?? "Padrão",
                perfil = usuario.NivelAcesso?.ToLower() ?? "funcionario"
            });
        }

        [HttpGet("preferencias/{usuarioId}")]
        public async Task<IActionResult> ObterPreferencias(int usuarioId)
        {
            var pref = await _context.PreferenciasUsuario.FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

            if (pref == null)
            {
                return Ok(new {
                    alertaEstagiario = true,
                    alertaAtestado = true,
                    resumoPendencias = true,
                    formatoExportacao = "pdf"
                });
            }

            return Ok(new {
                alertaEstagiario = pref.AlertaEstagiario,
                alertaAtestado = pref.AlertaAtestado,
                resumoPendencias = pref.ResumoPendencias,
                formatoExportacao = pref.FormatoExportacao
            });
        }

        [HttpPut("preferencias/{usuarioId}")]
        public async Task<IActionResult> SalvarPreferencias(int usuarioId, [FromBody] PreferenciasDto dto)
        {
            var usuario = await _context.Usuarios.FindAsync(usuarioId);
            var pref = await _context.PreferenciasUsuario.FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

            if (pref == null)
            {
                pref = new PreferenciaUsuario { UsuarioId = usuarioId };
                _context.PreferenciasUsuario.Add(pref);
            }

            if (dto.alertaEstagiario.HasValue) pref.AlertaEstagiario = dto.alertaEstagiario.Value;
            if (dto.alertaAtestado.HasValue) pref.AlertaAtestado = dto.alertaAtestado.Value;
            if (dto.resumoPendencias.HasValue) pref.ResumoPendencias = dto.resumoPendencias.Value;
            if (!string.IsNullOrEmpty(dto.formatoExportacao)) pref.FormatoExportacao = dto.formatoExportacao;

            await _context.SaveChangesAsync();

            await _logService.RegistrarAsync(
                acao: "Atualização de Preferências",
                modulo: "Configurações",
                detalhes: "Preferências atualizadas pelo usuário ID: " + usuarioId,
                usuario: usuario?.NomeCompleto ?? "Sistema",
                nivel: "baixa"
            );

            return Ok(new { mensagem = "Preferência salva com sucesso." });
        }

        [HttpPut("senha/{usuarioId}")]
        public async Task<IActionResult> AlterarSenha(int usuarioId, [FromBody] AlterarSenhaDto dto)
        {
            var usuario = await _context.Usuarios.FindAsync(usuarioId);
            if (usuario == null) return NotFound(new { erro = "Usuário não encontrado." });

            var passHasher = new PasswordHasher<Usuario>();
            var verificacao = passHasher.VerifyHashedPassword(usuario, usuario.SenhaHash, dto.SenhaAtual);
            
            if (verificacao == PasswordVerificationResult.Failed)
            {
                await _logService.RegistrarAsync(
                    acao: "Falha na Alteração de Senha",
                    modulo: "Configurações / Segurança",
                    detalhes: "Tentativa de troca de senha com senha atual incorreta para o usuário: " + usuario.NomeCompleto,
                    usuario: usuario.NomeCompleto,
                    nivel: "alta"
                );

                return Unauthorized(new { erro = "Senha atual incorreta." });
            }

            if (string.IsNullOrWhiteSpace(dto.NovaSenha) || dto.NovaSenha.Length < 8)
            {
                return BadRequest(new { erro = "A nova senha deve ter no mínimo 8 caracteres." });
            }

            usuario.SenhaHash = passHasher.HashPassword(usuario, dto.NovaSenha);
            await _context.SaveChangesAsync();

            await _logService.RegistrarAsync(
                acao: "Alteração de Senha Bem-Sucedida",
                modulo: "Configurações / Segurança",
                detalhes: "O usuário " + usuario.NomeCompleto + " alterou a própria senha com sucesso.",
                usuario: usuario.NomeCompleto,
                nivel: "alta"
            );

            return Ok(new { mensagem = "Senha alterada com sucesso." });
        }
    }

    public class AlterarSenhaDto
    {
        public string SenhaAtual { get; set; } = string.Empty;
        public string NovaSenha { get; set; } = string.Empty;
    }
    
    public class PreferenciasDto
    {
        public bool? alertaEstagiario { get; set; }
        public bool? alertaAtestado { get; set; }
        public bool? resumoPendencias { get; set; }
        public string? formatoExportacao { get; set; }
    }
}
