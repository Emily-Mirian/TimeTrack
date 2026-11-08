using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;
using PontoOnline.Infrastructure.Context;
using Microsoft.AspNetCore.Identity;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/admin/usuarios")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogService _logService;

        public UsuariosController(AppDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        [HttpGet]
        public async Task<IActionResult> ListarUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Include(u => u.TipoContrato)
                .OrderBy(u => u.NomeCompleto)
                .ToListAsync();

            var resultado = usuarios.Select(u => new {
                id = u.UsuarioId,
                nome = u.NomeCompleto,
                email = u.Email,
                departamento = u.Departamento ?? "Tecnologia",
                perfil = u.NivelAcesso?.ToLower() ?? "funcionario",
                vinculo = u.IdTipoContrato.ToString(),
                vinculoNome = u.TipoContrato?.Nome ?? MapearIdParaVinculoString(u.IdTipoContrato)
            });

            return Ok(resultado);
        }

        [HttpPost]
        public async Task<IActionResult> CriarUsuario([FromBody] UsuarioDto dto)
        {
            try
            {
                bool emailExiste = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == dto.email.ToLower());
                if (emailExiste)
                {
                    return Conflict(new { erro = "Este e-mail já está cadastrado." });
                }

                int tipoContratoId = await ResolverContratoAsync(dto.vinculo);

                var passHasher = new PasswordHasher<Usuario>();
                var novoUsuario = new Usuario
                {
                    NomeCompleto = dto.nome,
                    Email = dto.email,
                    Departamento = dto.departamento,
                    NivelAcesso = dto.perfil,
                    IdTipoContrato = tipoContratoId,
                    DataAdmissao = DateTime.Now
                };
                
                novoUsuario.SenhaHash = passHasher.HashPassword(novoUsuario, "Mudar123*");

                _context.Usuarios.Add(novoUsuario);
                await _context.SaveChangesAsync();

                await _logService.RegistrarAsync(
                    acao: "Cadastro de Colaborador",
                    modulo: "Gestão de Usuários",
                    detalhes: "Novo colaborador cadastrado: " + dto.nome + " (" + dto.email + ")",
                    usuario: "Admin",
                    nivel: "media"
                );

                return Ok(new { mensagem = "Usuário cadastrado com sucesso!", id = novoUsuario.UsuarioId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message, detalhe = ex.InnerException?.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarUsuario(int id, [FromBody] UsuarioDto dto)
        {
            try
            {
                var usuario = await _context.Usuarios.FindAsync(id);
                if (usuario == null) return NotFound(new { erro = "Usuário não encontrado." });

                bool emailExiste = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == dto.email.ToLower() && u.UsuarioId != id);
                if (emailExiste)
                {
                    return Conflict(new { erro = "Este e-mail já está cadastrado." });
                }

                string nomeAntigo = usuario.NomeCompleto;

                usuario.NomeCompleto = dto.nome;
                usuario.Email = dto.email;
                usuario.Departamento = dto.departamento;
                usuario.NivelAcesso = dto.perfil;
                usuario.IdTipoContrato = await ResolverContratoAsync(dto.vinculo);

                await _context.SaveChangesAsync();

                await _logService.RegistrarAsync(
                    acao: "Atualização de Colaborador",
                    modulo: "Gestão de Usuários",
                    detalhes: "Dados atualizados para o usuário: " + nomeAntigo + " -> " + dto.nome,
                    usuario: "Admin",
                    nivel: "media"
                );

                return Ok(new { mensagem = "Dados atualizados com sucesso!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message, detalhe = ex.InnerException?.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoverUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound(new { erro = "Usuário não encontrado." });

            string nomeRemovido = usuario.NomeCompleto;

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            await _logService.RegistrarAsync(
                acao: "Exclusão de Colaborador",
                modulo: "Gestão de Usuários",
                detalhes: "Colaborador removido do sistema: " + nomeRemovido,
                usuario: "Admin",
                nivel: "alta"
            );

            return Ok(new { mensagem = "Usuário removido com sucesso." });
        }

        // O vínculo agora é o ID do contrato (qualquer regra criada em Regras e Contratos).
        // Textos antigos (ex.: "estagio_6h") continuam sendo aceitos.
        private async Task<int> ResolverContratoAsync(string vinculo)
        {
            if (int.TryParse(vinculo, out int id) && await _context.TiposContrato.AnyAsync(c => c.ContratoId == id))
                return id;
            return MapearVinculoParaId(vinculo);
        }

        private int MapearVinculoParaId(string vinculo)
        {
            if (string.IsNullOrEmpty(vinculo)) return 1;
            string v = vinculo.ToLower();

            if (v.Contains("estagio")) return 2;
            if (v.Contains("jovem_aprendiz") || v.Contains("aprendiz")) return 3;
            return 1; 
        }

        private string MapearIdParaVinculoString(int idContrato)
        {
            return idContrato switch
            {
                2 => "estagio_6h",
                3 => "jovem_aprendiz",
                _ => "clt_8h"
            };
        }
    }

    public class UsuarioDto
    {
        public string nome { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string departamento { get; set; } = string.Empty;
        public string perfil { get; set; } = string.Empty;
        public string vinculo { get; set; } = string.Empty;
    }
}
