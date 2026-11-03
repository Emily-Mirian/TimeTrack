using System;
using System.Threading.Tasks;
using PontoOnline.Domain.Entities;

namespace PontoOnline.Infrastructure.Context
{
    public class LogService
    {
        private readonly AppDbContext _context;

        public LogService(AppDbContext context)
        {
            _context = context;
        }

        public async Task RegistrarAsync(string acao, string modulo, string detalhes, string usuario = "admin", string nivel = "media")
        {
            try
            {
                var log = new LogSistema
                {
                    DataHora = DateTime.Now,
                    Usuario = usuario,
                    Nivel = nivel,
                    Acao = acao,
                    Modulo = modulo,
                    Detalhes = detalhes
                };

                _context.LogsSistema.Add(log);
                await _context.SaveChangesAsync();
            }
            catch { }
        }
    }
}