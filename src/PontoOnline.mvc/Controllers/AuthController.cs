using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;
using PontoOnline.Infrastructure.Context;
using PontoOnline.mvc.DTOs;

namespace PontoOnline.mvc.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : Controller
{
    private readonly AppDbContext _context;
    private readonly PasswordHasher<Usuario> _passwordHasher = new();

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegisterRequestDto dto)
    {
        try
        {
            var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Email == dto.Email);
            if (usuarioExiste)
            {
                return BadRequest(new { erro = "Este e-mail já está cadastrado no sistema." });
            }

            var novoUsuario = new Usuario
            {
                NomeCompleto = dto.Nome,
                Email = dto.Email,
                IdTipoContrato = dto.TipoContratoId
            };

            novoUsuario.SenhaHash = _passwordHasher.HashPassword(novoUsuario, dto.Senha);

            _context.Usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Usuário cadastrado com sucesso!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.TipoContrato)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (usuario == null)
            {
                return Unauthorized(new { erro = "E-mail ou senha inválidos." });
            }

            var resultadoVerificacao = _passwordHasher.VerifyHashedPassword(usuario, usuario.SenhaHash, dto.Senha);

            if (resultadoVerificacao == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { erro = "E-mail ou senha inválidos." });
            }

            return Ok(new 
            { 
                mensagem = "Login realizado com sucesso!", 
                usuarioId = usuario.UsuarioId,
                nome = usuario.NomeCompleto,
                perfil = usuario.TipoContrato?.Nome ?? "Funcionario" 
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
}