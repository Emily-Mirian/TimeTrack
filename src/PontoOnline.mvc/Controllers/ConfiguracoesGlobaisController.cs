using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using PontoOnline.Infrastructure.Context;
using PontoOnline.Domain.Entities;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/config")]
    [ApiController]
    public class ConfiguracoesGlobaisController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogService _logService;

        public ConfiguracoesGlobaisController(AppDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        [HttpGet("seguranca")]
        public async Task<IActionResult> ObterSeguranca()
        {
            var config = await _context.ConfiguracoesGlobais.FirstOrDefaultAsync();
            if (config == null)
            {
                return Ok(new { expiracaoSessao = 30, senhaForte = true });
            }
            return Ok(new { expiracaoSessao = config.ExpiracaoSessao, senhaForte = config.SenhaForte });
        }

        [HttpGet("backup")]
        public async Task<IActionResult> ObterBackup()
        {
            var config = await _context.ConfiguracoesGlobais.FirstOrDefaultAsync();
            var freq = config?.FrequenciaBackup ?? "6h";
            return Ok(new { frequencia = freq, ultimoBackup = DateTime.Now.ToString("dd/MM/yyyy HH:mm") });
        }

        [HttpPut("seguranca")]
        public async Task<IActionResult> AtualizarSeguranca([FromBody] SegurancaDto dto)
        {
            try
            {
                if (dto.expiracaoSessao < 5 || dto.expiracaoSessao > 480)
                    return BadRequest(new { erro = "Informe um valor entre 5 e 480 minutos." });

                var config = await _context.ConfiguracoesGlobais.FirstOrDefaultAsync();
                if (config == null)
                {
                    config = new ConfiguracaoGlobal();
                    _context.ConfiguracoesGlobais.Add(config);
                }

                config.ExpiracaoSessao = dto.expiracaoSessao;
                config.SenhaForte = dto.senhaForte;
                await _context.SaveChangesAsync();

                await _logService.RegistrarAsync(
                    acao: "Atualização de Política de Segurança",
                    modulo: "Configurações Globales",
                    detalhes: "Expiração de sessão alterada para " + dto.expiracaoSessao + " minutos. Senha forte: " + dto.senhaForte,
                    usuario: "Admin",
                    nivel: "alta"
                );

                return Ok(new { mensagem = "Políticas de segurança salvas com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        [HttpPut("backup")]
        public async Task<IActionResult> AtualizarBackup([FromBody] BackupDto dto)
        {
            try
            {
                var config = await _context.ConfiguracoesGlobais.FirstOrDefaultAsync();
                if (config == null)
                {
                    config = new ConfiguracaoGlobal();
                    _context.ConfiguracoesGlobais.Add(config);
                }

                config.FrequenciaBackup = dto.frequencia;
                await _context.SaveChangesAsync();

                await _logService.RegistrarAsync(
                    acao: "Alteração de Frequência de Backup",
                    modulo: "Configurações Globales",
                    detalhes: "Frequência de backup alterada para: " + dto.frequencia,
                    usuario: "Admin",
                    nivel: "media"
                );

                return Ok(new { mensagem = "Frequência de backup alterada com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }
    }

    public class SegurancaDto
    {
        public int expiracaoSessao { get; set; }
        public bool senhaForte { get; set; }
    }

    public class BackupDto
    {
        public string frequencia { get; set; } = string.Empty;
    }
}
