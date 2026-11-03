using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PontoOnline.Infrastructure.Context;
using PontoOnline.Domain.Entities;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/permissoes")]
    [ApiController]
    public class PermissoesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LogService _logService;

        public PermissoesController(AppDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        [HttpGet]
        public async Task<IActionResult> ListarPermissoes()
        {
            // Busca o que está salvo no banco
            var salvas = await _context.PermissoesPerfil.ToListAsync();

            // Estrutura padrão base
            var funcoes = new List<object>
            {
                new {
                    id = "registrar_ponto",
                    nome = "Registrar Ponto Diário",
                    descricao = "Bater o próprio ponto",
                    perfis = new {
                        funcionario = new { tipo = "fixo" },
                        rh = new { tipo = "fixo" },
                        admin = new { tipo = "fixo" }
                    }
                },
                new {
                    id = "aprovar_atestados",
                    nome = "Aprovação de Atestados Médicos",
                    descricao = "Aprovar ou recusar atestados enviados",
                    perfis = new {
                        funcionario = new { tipo = "na" },
                        rh = new { tipo = "editavel", ativo = ObterEstado(salvas, "aprovar_atestados", "rh", true) },
                        admin = new { tipo = "fixo" }
                    }
                },
                new {
                    id = "editar_ponto",
                    nome = "Edição de Ponto",
                    descricao = "Ajustar batidas pela tela de Pendências",
                    perfis = new {
                        funcionario = new { tipo = "bloqueado" },
                        rh = new { tipo = "editavel", ativo = ObterEstado(salvas, "editar_ponto", "rh", true) },
                        admin = new { tipo = "fixo" }
                    }
                },
                new {
                    id = "importacao",
                    nome = "Importação de Planilhas (CSV)",
                    descricao = "Importar registros antigos de jornada",
                    perfis = new {
                        funcionario = new { tipo = "bloqueado" },
                        rh = new { tipo = "editavel", ativo = ObterEstado(salvas, "importacao", "rh", true) },
                        admin = new { tipo = "fixo" }
                    }
                },
                new {
                    id = "exportacao",
                    nome = "Exportação de Relatórios (PDF)",
                    descricao = "Gerar relatórios analíticos consolidados",
                    perfis = new {
                        funcionario = new { tipo = "bloqueado" },
                        rh = new { tipo = "editavel", ativo = ObterEstado(salvas, "exportacao", "rh", true) },
                        admin = new { tipo = "fixo" }
                    }
                },
                new {
                    id = "config_globais",
                    nome = "Configurações Globais",
                    descricao = "Segurança, módulos e backups do sistema",
                    perfis = new {
                        funcionario = new { tipo = "bloqueado" },
                        rh = new { tipo = "bloqueado" },
                        admin = new { tipo = "fixo" }
                    }
                }
            };

            return Ok(funcoes);
        }

        [HttpPut]
        public async Task<IActionResult> SalvarPermissoes([FromBody] List<PermissaoDto> listaAlteracoes)
        {
            try
            {
                if (listaAlteracoes == null || listaAlteracoes.Count == 0)
                    return BadRequest(new { erro = "Nenhuma alteração enviada." });

                foreach (var alt in listaAlteracoes)
                {
                    var registro = await _context.PermissoesPerfil
                        .FirstOrDefaultAsync(p => p.Funcao == alt.funcao && p.Perfil == alt.perfil);

                    if (registro == null)
                    {
                        _context.PermissoesPerfil.Add(new PermissaoPerfil
                        {
                            Funcao = alt.funcao,
                            Perfil = alt.perfil,
                            Ativo = alt.ativo
                        });
                    }
                    else
                    {
                        registro.Ativo = alt.ativo;
                    }
                }

                await _context.SaveChangesAsync();

                // Registra o log da alteração de permissão no sistema
                await _logService.RegistrarAsync(
                    acao: "Atualização de Permissões",
                    modulo: "Segurança e Acessos",
                    detalhes: "Total de " + listaAlteracoes.Count + " permissões atualizadas e salvas no banco.",
                    usuario: "Admin",
                    nivel: "alta"
                );

                return Ok(new { mensagem = "Permissões salvas no banco com sucesso!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        private bool ObterEstado(List<PermissaoPerfil> salvas, string funcao, string perfil, bool padrao)
        {
            var item = salvas.FirstOrDefault(s => s.Funcao == funcao && s.Perfil == perfil);
            return item != null ? item.Ativo : padrao;
        }
    }

    public class PermissaoDto
    {
        public string funcao { get; set; } = string.Empty;
        public string perfil { get; set; } = string.Empty;
        public bool ativo { get; set; }
    }
}