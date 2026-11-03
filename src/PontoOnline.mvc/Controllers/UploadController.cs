using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using PontoOnline.Infrastructure.Context;
using PontoOnline.Domain.Entities;

namespace PontoOnline.mvc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogService _logService;

        public UploadController(AppDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        [HttpPost("csv")]
        public async Task<IActionResult> ReceberPlanilhaCsv(IFormFile arquivo)
        {
            try
            {
                // VERIFICA SE A PERMISSÃO DE IMPORTAÇÃO ESTÁ ATIVA PARA O PERFIL (ex: RH)
                var permissao = await _context.PermissoesPerfil
                    .FirstOrDefaultAsync(p => p.Funcao == "importacao" && p.Perfil == "rh");

                if (permissao != null && !permissao.Ativo)
                {
                    await _logService.RegistrarAsync(
                        acao: "Acesso Negado - Importação CSV",
                        modulo: "Segurança e Acessos",
                        detalhes: "Tentativa de importar planilha bloqueada por falta de permissão no perfil.",
                        usuario: "RH",
                        nivel: "alta"
                    );
                    return StatusCode(403, new { Mensagem = "Acesso negado: seu perfil não tem permissão para importar planilhas." });
                }
            
                if (arquivo == null || arquivo.Length == 0)
                    return BadRequest(new { Mensagem = "Nenhum arquivo foi enviado." });

                var resultados = new List<object>();
                var novosRegistros = new List<RegistroPonto>();

                using (var stream = new StreamReader(arquivo.OpenReadStream()))
                {
                    await stream.ReadLineAsync();

                    while (!stream.EndOfStream)
                    {
                        var linha = await stream.ReadLineAsync();
                        if (string.IsNullOrWhiteSpace(linha)) continue;

                        var colunas = linha.Split(',');

                        if (colunas.Length < 6) continue;
                        int.TryParse(colunas[0], out int usuarioId);
                        DateTime.TryParse(colunas[1], out DateTime dataSomente);
                        TimeSpan.TryParse(colunas[2], out TimeSpan tEntrada1);
                        TimeSpan.TryParse(colunas[3], out TimeSpan tSaidaAlmoco);
                        TimeSpan.TryParse(colunas[4], out TimeSpan tRetornoAlmoco);
                        TimeSpan.TryParse(colunas[5], out TimeSpan tSaida2);

                        var ponto = new RegistroPonto
                        {
                            IdUsuario = usuarioId, 
                            DataRegistro = dataSomente,
                            Entrada1 = dataSomente.Add(tEntrada1),
                            SaidaAlmoco = tSaidaAlmoco.TotalSeconds > 0 ? dataSomente.Add(tSaidaAlmoco) : null,
                            RetornoAlmoco = tRetornoAlmoco.TotalSeconds > 0 ? dataSomente.Add(tRetornoAlmoco) : null,
                            Saida2 = tSaida2.TotalSeconds > 0 ? dataSomente.Add(tSaida2) : null,
                            SaldoDiarioMinutos = 0 
                        };

                        novosRegistros.Add(ponto);
                        TimeSpan horasTrabalhadas = (tSaidaAlmoco - tEntrada1) + (tSaida2 - tRetornoAlmoco);
                        resultados.Add(new { Data = colunas[1], TotalTrabalhado = horasTrabalhadas.ToString(@"hh\:mm") });
                    }
                }

                if (novosRegistros.Any())
                {
                    await _context.RegistrosPonto.AddRangeAsync(novosRegistros);
                    await _context.SaveChangesAsync();

                    // REGISTRA O LOG DE IMPORTAÇÃO EM LOTE
                    await _logService.RegistrarAsync(
                        acao: "Importação de Planilha CSV",
                        modulo: "Upload e Processamento",
                        detalhes: "Arquivo importado com sucesso: " + arquivo.FileName + " | Total de registros: " + novosRegistros.Count,
                        usuario: "Admin",
                        nivel: "media"
                    );
                }

                return Ok(new { Mensagem = novosRegistros.Count + " registros importados com sucesso pro banco!", Registros = resultados });
            }
            catch (Exception ex)
            {
                string erroReal = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(new { Mensagem = "Falha no C#: " + erroReal });
            }
        }
    }
}