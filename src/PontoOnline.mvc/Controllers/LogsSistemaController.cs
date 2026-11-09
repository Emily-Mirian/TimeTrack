using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PontoOnline.Infrastructure.Context;
using PontoOnline.Domain.Entities;
using System;
using System.Text;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/logs-sistema")]
    [ApiController]
    public class LogsSistemaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LogsSistemaController(AppDbContext context)
        {
            _context = context;
        }

        // O filtro da tela usa categorias (admin/rh/sistema); no banco fica o nome real de quem agiu.
        private static IQueryable<LogSistema> FiltrarPorUsuario(IQueryable<LogSistema> q, string usuario)
        {
            var u = usuario.ToLower();
            return u switch
            {
                "admin" => q.Where(l => l.Usuario.ToLower().Contains("admin")),
                "rh" => q.Where(l => l.Usuario.ToLower() == "rh" || l.Usuario.ToLower().Contains("gestor rh")),
                "nao_identificado" => q.Where(l => l.Usuario.ToLower() == "não identificado"
                                                   || l.Usuario.ToLower() == "nao identificado"
                                                   || l.Usuario.ToLower() == "desconhecido"
                                                   || l.Usuario.ToLower() == "sistema"),
                _ => q.Where(l => l.Usuario.ToLower() == u)
            };
        }

        [HttpGet]
        public async Task<IActionResult> ListarLogs([FromQuery] string? data, [FromQuery] string? usuario, [FromQuery] string? nivel)
        {
            try
            {
                var query = _context.LogsSistema.AsQueryable();

                if (!string.IsNullOrEmpty(data) && DateTime.TryParse(data, out DateTime dataParsed))
                {
                    query = query.Where(l => l.DataHora.Date == dataParsed.Date);
                }
                if (!string.IsNullOrEmpty(usuario) && usuario != "todos")
                {
                    query = FiltrarPorUsuario(query, usuario);
                }
                if (!string.IsNullOrEmpty(nivel) && nivel != "todos")
                {
                    query = query.Where(l => l.Nivel.ToLower() == nivel.ToLower());
                }

                var logs = await query.OrderByDescending(l => l.DataHora).ToListAsync();

                var resultado = logs.Select(l => new {
                    id = l.LogId,
                    dataHora = l.DataHora.ToString("yyyy-MM-ddTHH:mm"),
                    usuario = l.Usuario,
                    nivel = l.Nivel,
                    acao = l.Acao,
                    modulo = l.Modulo,
                    detalhes = l.Detalhes ?? ""
                });

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        [HttpGet("exportar")]
        public async Task<IActionResult> ExportarLogs([FromQuery] string? data, [FromQuery] string? usuario, [FromQuery] string? nivel)
        {
            var query = _context.LogsSistema.AsQueryable();

            if (!string.IsNullOrEmpty(data) && DateTime.TryParse(data, out DateTime dataParsed))
            {
                query = query.Where(l => l.DataHora.Date == dataParsed.Date);
            }
            if (!string.IsNullOrEmpty(usuario) && usuario != "todos")
            {
                query = FiltrarPorUsuario(query, usuario);
            }
            if (!string.IsNullOrEmpty(nivel) && nivel != "todos")
            {
                query = query.Where(l => l.Nivel.ToLower() == nivel.ToLower());
            }

            var logs = await query.OrderByDescending(l => l.DataHora).ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("\"Data/Hora\";\"Usuário\";\"Criticidade\";\"Ação\";\"Módulo\";\"Detalhes\"");

            foreach (var l in logs)
            {
                csv.AppendLine($"\"{l.DataHora:dd/MM/yyyy HH:mm}\";\"{l.Usuario}\";\"{l.Nivel}\";\"{l.Acao}\";\"{l.Modulo}\";\"{l.Detalhes?.Replace("\"", "\"\"")}\"");
            }

            _context.LogsSistema.Add(new LogSistema
            {
                DataHora = DateTime.Now,
                Usuario = "admin",
                Nivel = "baixa",
                Acao = "Exportação de Logs do Sistema",
                Modulo = "Auditoria de Logs",
                Detalhes = $"Filtros aplicados -> Data: {data ?? "N/A"}, Usuário: {usuario ?? "todos"}, Nível: {nivel ?? "todos"}"
            });
            await _context.SaveChangesAsync();

            var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray();
            return File(bytes, "text/csv", $"logs_sistema_{DateTime.Now:yyyy-MM-dd}.csv");
        }
    }
}