using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using PontoOnline.Infrastructure.Context;
using PontoOnline.Domain.Entities;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditoriaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditoriaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> ObterLogs()
        {
            try
            {
                // Esta tela é só a auditoria de PONTO: eventos de módulos, bloqueio de acesso,
                // cadastro de usuário e importação ficam de fora (ficam no registro global de logs).
                var logsDoBanco = (await _context.AuditoriaLogs
                    .OrderByDescending(l => l.DataHora)
                    .ToListAsync())
                    .Where(l =>
                    {
                        var a = (l.Acao ?? "").ToLower();
                        return !(a.Contains("modulo") || a.Contains("bloqueio") || a.Contains("cadastro")
                                 || a.Contains("importacao") || a.Contains("importação"));
                    })
                    .ToList();

                var idsUsuarios = logsDoBanco
                    .Select(l => l.UsuarioResponsavelId)
                    .Distinct()
                    .ToList();

                var usuarios = await _context.Usuarios
                    .Where(u => idsUsuarios.Contains(u.UsuarioId))
                    .ToDictionaryAsync(u => u.UsuarioId);

                var resultado = logsDoBanco.Select(l => {
                    string acaoNormalizada = "edicao_ponto";
                    var acaoDb = (l.Acao ?? "").ToLower();

                    if (acaoDb.Contains("excesso")) acaoNormalizada = "excesso_jornada";
                    else if (acaoDb.Contains("atestado")) acaoNormalizada = "atestado";

                    string nomeAutor = "Administrador";
                    string classeAtor = "admin";

                    if (usuarios.TryGetValue(l.UsuarioResponsavelId, out var usuario))
                    {
                        nomeAutor = usuario.NomeCompleto;
                        classeAtor = (usuario.NivelAcesso ?? "").ToLower() == "rh" ? "rh" : "admin";
                    }

                    return new {
                        data = l.DataHora.ToString("yyyy-MM-ddTHH:mm:ss"),
                        ator = classeAtor,       
                        autor = nomeAutor,       
                        tipo = acaoNormalizada, 
                        detalhe = System.Text.RegularExpressions.Regex.Replace(l.Detalhes ?? "", @"^\[PONTO:\d+\]\s*", "")
                    };
                });

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }
    }
}
