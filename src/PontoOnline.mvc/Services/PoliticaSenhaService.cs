using Microsoft.EntityFrameworkCore;
using PontoOnline.Infrastructure.Context;

namespace PontoOnline.mvc.Services;

// Aplica a política de senha definida em Configurações Globais (Exigir senhas fortes).
public class PoliticaSenhaService
{
    private readonly AppDbContext _context;

    public PoliticaSenhaService(AppDbContext context)
    {
        _context = context;
    }

    // Devolve null se a senha é aceita, ou a mensagem do que falta.
    public async Task<string?> ValidarAsync(string? senha)
    {
        var config = await _context.ConfiguracoesGlobais.FirstOrDefaultAsync();
        bool exigirForte = config?.SenhaForte ?? true;
        return Validar(senha, exigirForte);
    }

    public static string? Validar(string? senha, bool exigirForte)
    {
        if (string.IsNullOrWhiteSpace(senha) || senha.Length < 8)
            return "A senha deve ter no mínimo 8 caracteres.";

        if (!exigirForte) return null;

        var faltando = new List<string>();
        if (!senha.Any(char.IsUpper)) faltando.Add("uma letra maiúscula");
        if (!senha.Any(char.IsLower)) faltando.Add("uma letra minúscula");
        if (!senha.Any(char.IsDigit)) faltando.Add("um número");
        if (!senha.Any(c => !char.IsLetterOrDigit(c) && !char.IsWhiteSpace(c))) faltando.Add("um símbolo (ex.: ! @ # $)");

        return faltando.Count == 0
            ? null
            : "Senha fraca: inclua " + string.Join(", ", faltando) + ".";
    }
}
