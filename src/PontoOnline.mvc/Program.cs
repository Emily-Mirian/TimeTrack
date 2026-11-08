using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;
using PontoOnline.Domain.Services;
using PontoOnline.Infrastructure.Context;

using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 36))));

builder.Services.AddControllersWithViews();
builder.Services.AddCors(o => o.AddPolicy("front", p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddScoped<CalculoPontoService>();
builder.Services.AddScoped<LogService>();
builder.Services.AddScoped<PontoOnline.mvc.Services.NotificacaoService>();
builder.Services.AddScoped<PontoOnline.mvc.Services.EmailService>();
builder.Services.AddScoped<PontoOnline.mvc.Services.ModulosService>();
builder.Services.AddScoped<PontoOnline.mvc.Services.PoliticaSenhaService>();
builder.Services.AddHostedService<PontoOnline.mvc.Services.LimiteJornadaEmailWorker>();

QuestPDF.Settings.License = LicenseType.Community;


var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();

        var hasher = new PasswordHasher<Usuario>();
        void GarantirUsuario(string nome, string email, string nivel)
        {
            if (db.Usuarios.Any(x => x.Email == email)) return;
            var novo = new Usuario
            {
                NomeCompleto = nome,
                Email = email,
                NivelAcesso = nivel,
                IdTipoContrato = 1,
                DataAdmissao = new DateTime(2026, 1, 1)
            };
            novo.SenhaHash = hasher.HashPassword(novo, "Senha123!");
            db.Usuarios.Add(novo);
            db.SaveChanges();
        }

        GarantirUsuario("Administrador Master", "admin@empresa.com", "admin");
        GarantirUsuario("Gestor RH Padrão", "rh@empresa.com", "rh");
        Console.WriteLine("[BANCO] Pronto.");
    }
    catch (Exception ex)
    {
        Console.WriteLine("[BANCO ERRO] " + ex);
    }
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseCors("front");
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllers();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();