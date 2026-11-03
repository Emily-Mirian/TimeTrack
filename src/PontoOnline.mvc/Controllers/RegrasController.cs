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
    [Route("api/regras")]
    [ApiController]
    public class RegrasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogService _logService;

        public RegrasController(AppDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        [HttpGet]
        public async Task<IActionResult> ListarRegras()
        {
            try
            {
                var contratos = await _context.TiposContrato.ToListAsync();

                var resultado = contratos.Select(c => new {
                    id = c.ContratoId.ToString(),
                    nome = c.Nome,
                    cargasDiarias = new int[] { (c.CargaHorariaDiariaMinutos > 0 ? c.CargaHorariaDiariaMinutos : 480) / 60 },
                    limiteSemanal = (c.CargaHorariaSemanaMinutos > 0 ? c.CargaHorariaSemanaMinutos : 2640) / 60,
                    toleranciaMin = c.ToleranciaMinutos,
                    bancoHoras = c.PermiteBancoHoras,
                    bloqueioHoraExtra = !c.PermiteHoraExtra
                });

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarRegra(int id, [FromBody] RegraDto dto)
        {
            try
            {
                var contrato = await _context.TiposContrato.FindAsync(id);
                if (contrato == null) return NotFound(new { erro = "Regra não encontrada." });

                var nomeAntigo = contrato.Nome;

                contrato.Nome = dto.nome;
                contrato.CargaHorariaDiariaMinutos = (dto.cargasDiarias.FirstOrDefault() > 0 ? dto.cargasDiarias.First() : 8) * 60;
                contrato.CargaHorariaSemanaMinutos = dto.limiteSemanal * 60;
                contrato.ToleranciaMinutos = dto.toleranciaMin;
                contrato.PermiteBancoHoras = dto.bancoHoras;
                contrato.PermiteHoraExtra = !dto.bloqueioHoraExtra;

                await _context.SaveChangesAsync();

                // REGISTRA O LOG AUTOMATICAMENTE
                await _logService.RegistrarAsync(
                    acao: "Atualização de Regra / Contrato",
                    modulo: "Regras e Contratos",
                    detalhes: "Regra atualizada: " + nomeAntigo + " -> " + dto.nome,
                    usuario: "Admin",
                    nivel: "alta"
                );

                return Ok(new { mensagem = "Regra atualizada com sucesso!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }
    }

    public class RegraDto
    {
        public string nome { get; set; } = string.Empty;
        public int[] cargasDiarias { get; set; } = new int[0];
        public int limiteSemanal { get; set; }
        public int toleranciaMin { get; set; }
        public bool bancoHoras { get; set; }
        public bool bloqueioHoraExtra { get; set; }
    }
}