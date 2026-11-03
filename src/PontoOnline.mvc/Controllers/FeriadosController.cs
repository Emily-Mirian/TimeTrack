using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PontoOnline.Infrastructure.Context;
using PontoOnline.Domain.Entities;
using System;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/feriados")]
    [ApiController]
    public class FeriadosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogService _logService;

        public FeriadosController(AppDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        // 1. Listar feriados
        [HttpGet]
        public async Task<IActionResult> ListarFeriados([FromQuery] int? ano)
        {
            var query = _context.Feriados.AsQueryable();

            if (ano.HasValue)
            {
                query = query.Where(f => f.Data.Year == ano.Value);
            }

            var feriados = await query.OrderBy(f => f.Data).ToListAsync();

            var resultado = feriados.Select(f => new {
                id = f.FeriadoId,
                data = f.Data.ToString("yyyy-MM-dd"),
                descricao = f.Descricao,
                tipo = f.Tipo
            });

            return Ok(resultado);
        }

        // 2. Cadastrar novo feriado (POST)
        [HttpPost]
        public async Task<IActionResult> CriarFeriado([FromBody] FeriadoDto dto)
        {
            if (!DateTime.TryParse(dto.data, out DateTime dataParsed))
            {
                return BadRequest(new { erro = "Data inválida." });
            }

            bool dataExiste = await _context.Feriados.AnyAsync(f => f.Data.Date == dataParsed.Date);
            if (dataExiste)
            {
                return Conflict(new { erro = "Já existe um feriado nesta data." });
            }

            var novoFeriado = new Feriado
            {
                Data = dataParsed,
                Descricao = dto.descricao,
                Tipo = dto.tipo
            };

            _context.Feriados.Add(novoFeriado);
            await _context.SaveChangesAsync();

            // REGISTRA O LOG DE CADASTRO
            await _logService.RegistrarAsync(
                acao: "Cadastro de Feriado",
                modulo: "Calendário",
                detalhes: "Feriado criado: " + dto.descricao + " em " + dto.data,
                usuario: "Admin",
                nivel: "media"
            );

            return Ok(new { 
                id = novoFeriado.FeriadoId, 
                data = novoFeriado.Data.ToString("yyyy-MM-dd"), 
                descricao = novoFeriado.Descricao, 
                tipo = novoFeriado.Tipo 
            });
        }

        // 3. Atualizar feriado existente (PUT)
        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarFeriado(int id, [FromBody] FeriadoDto dto)
        {
            var feriado = await _context.Feriados.FindAsync(id);
            if (feriado == null) return NotFound(new { erro = "Feriado não encontrado." });

            if (!DateTime.TryParse(dto.data, out DateTime dataParsed))
            {
                return BadRequest(new { erro = "Data inválida." });
            }

            bool dataExiste = await _context.Feriados.AnyAsync(f => f.Data.Date == dataParsed.Date && f.FeriadoId != id);
            if (dataExiste)
            {
                return Conflict(new { erro = "Já existe um feriado nesta data." });
            }

            feriado.Data = dataParsed;
            feriado.Descricao = dto.descricao;
            feriado.Tipo = dto.tipo;

            await _context.SaveChangesAsync();

            // REGISTRA O LOG DE ATUALIZAÇÃO
            await _logService.RegistrarAsync(
                acao: "Atualização de Feriado",
                modulo: "Calendário",
                detalhes: "Feriado atualizado ID " + id + " para: " + dto.descricao,
                usuario: "Admin",
                nivel: "baixa"
            );

            return Ok(new { 
                id = feriado.FeriadoId, 
                data = feriado.Data.ToString("yyyy-MM-dd"), 
                descricao = feriado.Descricao, 
                tipo = feriado.Tipo 
            });
        }

        // 4. Excluir feriado (DELETE)
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoverFeriado(int id)
        {
            var feriado = await _context.Feriados.FindAsync(id);
            if (feriado == null) return NotFound(new { erro = "Feriado não encontrado." });

            var descFeriado = feriado.Descricao;

            _context.Feriados.Remove(feriado);
            await _context.SaveChangesAsync();

            // REGISTRA O LOG DE EXCLUSÃO
            await _logService.RegistrarAsync(
                acao: "Exclusão de Feriado",
                modulo: "Calendário",
                detalhes: "Feriado removido: " + descFeriado,
                usuario: "Admin",
                nivel: "alta"
            );

            return Ok(new { mensagem = "Feriado removido com sucesso." });
        }
    }

    public class FeriadoDto
    {
        public string data { get; set; } = string.Empty;
        public string descricao { get; set; } = string.Empty;
        public string tipo { get; set; } = string.Empty;
    }
}