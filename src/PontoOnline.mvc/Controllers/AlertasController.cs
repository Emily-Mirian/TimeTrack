using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Services;
using PontoOnline.Infrastructure.Context;

namespace PontoOnline.mvc.Controllers
{
    [Route("api/alertas")]
    [ApiController]
    public class AlertasController : ControllerBase
    {
        private const double PercentualProximo = 0.90;
        private readonly AppDbContext _context;
        private readonly CalculoPontoService _calculo;

        public AlertasController(AppDbContext context, CalculoPontoService calculo)
        {
            _context = context;
            _calculo = calculo;
        }

        // Quem está em contrato SEM hora extra (ex.: estagiário) e hoje já está perto, atingiu ou passou do limite diário.
        [HttpGet("estagiarios")]
        public async Task<IActionResult> EstagiariosNoLimite()
        {
            var hoje = DateTime.Today;
            var agora = DateTime.Now;
            var fechamento = new FechamentoService();

            var registros = await _context.RegistrosPonto
                .Include(r => r.Usuario)
                .ThenInclude(u => u!.TipoContrato)
                .Where(r => r.DataRegistro.Date == hoje
                            && r.Entrada1 != null
                            && r.Usuario!.TipoContrato != null
                            && !r.Usuario.TipoContrato.PermiteHoraExtra)
                .ToListAsync();

            var alertas = new List<object>();
            foreach (var r in registros)
            {
                var contrato = r.Usuario!.TipoContrato!;
                int meta = contrato.CargaHorariaDiariaMinutos;
                if (meta <= 0) continue;

                bool encerrado = r.Saida2.HasValue && r.Saida2.Value.Year >= 2000;
                int trabalhado = encerrado
                    ? fechamento.CalcularMinutosTrabalhados(r)
                    : _calculo.CalcularMinutosParciais(r, agora);

                double pct = (double)trabalhado / meta;
                if (pct < PercentualProximo) continue;

                string situacao =
                    trabalhado > meta + FechamentoService.ToleranciaExcessoMinutos ? "ultrapassou"
                    : trabalhado >= meta - FechamentoService.ToleranciaExcessoMinutos ? "atingiu"
                    : "proximo";

                alertas.Add(new
                {
                    nome = r.Usuario.NomeCompleto,
                    contrato = contrato.Nome,
                    trabalhado = FechamentoService.FormatarMinutos(trabalhado),
                    limite = FechamentoService.FormatarMinutos(meta),
                    percentual = (int)Math.Round(pct * 100),
                    situacao,
                    encerrado
                });
            }

            return Ok(alertas);
        }
    }
}
