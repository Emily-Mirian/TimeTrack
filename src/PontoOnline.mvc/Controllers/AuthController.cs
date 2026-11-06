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
    private readonly LogService _logService;
    private readonly PasswordHasher<Usuario> _passwordHasher = new();

    public AuthController(AppDbContext context, LogService logService)
    {
        _context = context;
        _logService = logService;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegisterRequestDto dto)
    {
        try
        {
            Console.WriteLine($"[REGISTRO] Tentativa recebida: Nome='{dto?.Nome}', Email='{dto?.Email}', ContratoId={dto?.TipoContratoId}");

            if (dto == null || string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Senha))
            {
                Console.WriteLine("[REGISTRO ERRO] Dados vieram vazios.");
                return BadRequest(new { erro = "Preencha todos os campos obrigatórios." });
            }

            var emailLimpo = dto.Email.Trim().ToLower();

            var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == emailLimpo);
            if (usuarioExiste)
            {
                Console.WriteLine("[REGISTRO ERRO] Este e-mail já existe na base de dados.");
                return BadRequest(new { erro = "Este e-mail já está cadastrado no sistema." });
            }

            var novoUsuario = new Usuario
            {
                NomeCompleto = dto.Nome,
                Email = emailLimpo,
                IdTipoContrato = dto.TipoContratoId,
                NivelAcesso = "Funcionario",
                DataAdmissao = DateTime.Today
            };

            novoUsuario.SenhaHash = _passwordHasher.HashPassword(novoUsuario, dto.Senha);

            _context.Usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            await _logService.RegistrarAsync(
                acao: "Cadastro de Novo Usuário",
                modulo: "Autenticação",
                detalhes: "Usuário cadastrado: ${dto.Nome} (${emailLimpo})",
                usuario: dto.Nome,
                nivel: "media"
            );

            Console.WriteLine("[REGISTRO] Sucesso absoluto! Usuário salvo no MySQL.");
            return Ok(new { mensagem = "Usuário cadastrado com sucesso!" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[REGISTRO EXCEPTION] {ex.Message}");
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        try
        {
            Console.WriteLine($"[LOGIN] Tentativa para o e-mail: '{dto?.Email}'");

            if (dto == null || string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Senha))
            {
                return Unauthorized(new { erro = "E-mail ou senha inválidos." });
            }

            var emailLimpo = dto.Email.Trim().ToLower();

            var usuario = await _context.Usuarios
                .Include(u => u.TipoContrato)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailLimpo);

            if (usuario == null)
            {
                Console.WriteLine("[LOGIN] Usuário NÃO encontrado na tabela Usuario do MySQL.");
                
                await _logService.RegistrarAsync(
                    acao: "Tentativa de Login Falha",
                    modulo: "Autenticação",
                    detalhes: "E-mail não encontrado: ${emailLimpo}",
                    usuario: "Desconhecido",
                    nivel: "alta"
                );

                return Unauthorized(new { erro = "E-mail ou senha inválidos." });
            }

            var resultadoVerificacao = _passwordHasher.VerifyHashedPassword(usuario, usuario.SenhaHash, dto.Senha);

            if (resultadoVerificacao == PasswordVerificationResult.Failed)
            {
                Console.WriteLine("[LOGIN] A senha informada não confere com o Hash.");
                
                await _logService.RegistrarAsync(
                    acao: "Falha de Autenticação",
                    modulo: "Autenticação",
                    detalhes: "Senha incorreta para o e-mail: ${emailLimpo}",
                    usuario: usuario.NomeCompleto,
                    nivel: "alta"
                );

                return Unauthorized(new { erro = "E-mail ou senha inválidos." });
            }

            await _logService.RegistrarAsync(
                acao: "Login no Sistema",
                modulo: "Autenticação",
                detalhes: "Usuário logado com sucesso: ${usuario.NomeCompleto}",
                usuario: usuario.NomeCompleto,
                nivel: "baixa"
            );

            Console.WriteLine("[LOGIN] Sucesso! Login validado.");
            return Ok(new
            {
                mensagem = "Login realizado com sucesso!",
                token = "",
                usuarioId = usuario.UsuarioId,
                nome = usuario.NomeCompleto,
                perfil = usuario.NivelAcesso.ToLower(),
                vinculo = usuario.TipoContrato?.Nome ?? "CLT"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LOGIN EXCEPTION] {ex.Message}");
            return BadRequest(new { erro = ex.Message });
        }
    }
}
