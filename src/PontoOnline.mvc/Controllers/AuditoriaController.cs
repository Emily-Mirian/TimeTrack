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
                var logsDoBanco = await _context.AuditoriaLogs
                    .OrderByDescending(l => l.DataHora)
                    .ToListAsync();

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

                    if (acaoDb.Contains("atestado")) acaoNormalizada = "atestado";
                    else if (acaoDb.Contains("bloqueio")) acaoNormalizada = "bloqueio";
                    else if (acaoDb.Contains("cadastro")) acaoNormalizada = "cadastro";
                    else if (acaoDb.Contains("importacao") || acaoDb.Contains("importação")) acaoNormalizada = "importacao";

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
                        detalhe = l.Detalhes
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
