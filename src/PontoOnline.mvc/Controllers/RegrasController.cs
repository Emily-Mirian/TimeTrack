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

        [HttpPost]
        public async Task<IActionResult> CriarRegra([FromBody] RegraDto dto)
        {
            try
            {
                var nome = (dto.nome ?? "").Trim();
                if (nome.Length < 3)
                    return BadRequest(new { erro = "Informe o nome do regime (mínimo 3 caracteres)." });

                var cargaHoras = dto.cargasDiarias.FirstOrDefault();
                if (cargaHoras < 1 || cargaHoras > 12)
                    return BadRequest(new { erro = "A carga diária deve estar entre 1 e 12 horas." });

                if (dto.limiteSemanal < 1 || dto.limiteSemanal > 60)
                    return BadRequest(new { erro = "O limite semanal deve estar entre 1 e 60 horas." });

                bool existe = await _context.TiposContrato.AnyAsync(c => c.Nome.ToLower() == nome.ToLower());
                if (existe)
                    return Conflict(new { erro = "Já existe uma regra com esse nome." });

                var contrato = new TipoContrato
                {
                    Nome = nome,
                    CargaHorariaDiariaMinutos = cargaHoras * 60,
                    CargaHorariaSemanaMinutos = dto.limiteSemanal * 60,
                    ToleranciaMinutos = dto.toleranciaMin,
                    PermiteHoraExtra = !dto.bloqueioHoraExtra,
                    PermiteBancoHoras = dto.bloqueioHoraExtra ? false : dto.bancoHoras
                };

                _context.TiposContrato.Add(contrato);
                await _context.SaveChangesAsync();

                await _logService.RegistrarAsync(
                    acao: "Criação de Regra / Contrato",
                    modulo: "Regras e Contratos",
                    detalhes: "Nova regra criada: " + nome,
                    usuario: "Admin",
                    nivel: "alta"
                );

                return Ok(new { mensagem = "Regra criada com sucesso!", id = contrato.ContratoId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message, detalhe = ex.InnerException?.Message });
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
