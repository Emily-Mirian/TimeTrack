using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;
using System;

namespace PontoOnline.Infrastructure.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<TipoContrato> TiposContrato => Set<TipoContrato>();
    public DbSet<RegistroPonto> RegistrosPonto => Set<RegistroPonto>();
    public DbSet<Feriado> Feriados => Set<Feriado>();
    public DbSet<AusenciaJustificada> AusenciasJustificadas => Set<AusenciaJustificada>();
    public DbSet<FechamentoMensal> FechamentosMensais => Set<FechamentoMensal>();
    public DbSet<AuditoriaLog> AuditoriaLogs => Set<AuditoriaLog>();
    public DbSet<PreferenciaUsuario> PreferenciasUsuario => Set<PreferenciaUsuario>();
    public DbSet<Feriado> Feriado => Set<Feriado>();
    public DbSet<Notificacao> Notificacoes => Set<Notificacao>();
    public DbSet<HistoricoArquivo> HistoricoArquivos => Set<HistoricoArquivo>();
    public DbSet<LogSistema> LogsSistema => Set<LogSistema>();
    public DbSet<PermissaoPerfil> PermissoesPerfil => Set<PermissaoPerfil>();
    public DbSet<ConfiguracaoGlobal> ConfiguracoesGlobais => Set<ConfiguracaoGlobal>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TipoContrato>()
            .ToTable("TipoContrato")
            .HasKey(tc => tc.ContratoId);

        modelBuilder.Entity<Feriado>()
            .ToTable("Feriado")
            .HasKey(f => f.FeriadoId);

        modelBuilder.Entity<Usuario>()
            .ToTable("Usuario")
            .HasKey(u => u.UsuarioId);

        modelBuilder.Entity<RegistroPonto>()
            .ToTable("RegistroPonto")
            .HasKey(rp => rp.PontoId);

        modelBuilder.Entity<AusenciaJustificada>()
            .ToTable("AusenciaJustificada")
            .HasKey(a => a.AusenciaId); 

        modelBuilder.Entity<FechamentoMensal>()
            .ToTable("FechamentoMensal")
            .HasKey(fm => fm.FechamentoId); 

        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.TipoContrato)
            .WithMany(tc => tc.Usuarios)
            .HasForeignKey(u => u.IdTipoContrato);

        modelBuilder.Entity<RegistroPonto>()
            .HasOne(rp => rp.Usuario)
            .WithMany(u => u.RegistrosPonto)
            .HasForeignKey(rp => rp.IdUsuario);

        modelBuilder.Entity<RegistroPonto>()
            .HasOne(r => r.Feriado)
            .WithMany()
            .HasForeignKey(r => r.IdFeriado)
            .IsRequired(false);

        modelBuilder.Entity<AusenciaJustificada>()
            .HasOne(a => a.Usuario)
            .WithMany(u => u.AusenciasJustificadas)
            .HasForeignKey(a => a.IdUsuario);

        modelBuilder.Entity<FechamentoMensal>()
            .HasOne(fm => fm.Usuario)
            .WithMany(u => u.FechamentosMensais)
            .HasForeignKey(fm => fm.IdUsuario);
            
        modelBuilder.Entity<AuditoriaLog>()
            .ToTable("AuditoriaLog")
            .HasKey(al => al.LogId);

        modelBuilder.Entity<AuditoriaLog>()
            .HasOne(al => al.UsuarioResponsavel)
            .WithMany()
            .HasForeignKey(al => al.UsuarioResponsavelId);

        modelBuilder.Entity<PreferenciaUsuario>()
            .ToTable("PreferenciaUsuario")
            .HasKey(p => p.PreferenciaId);

        modelBuilder.Entity<PermissaoPerfil>().ToTable("permissoesperfil").HasKey(p => p.Id);

        modelBuilder.Entity<TipoContrato>().HasData(
    new TipoContrato 
    { 
        ContratoId = 1, 
        Nome = "CLT", 
        CargaHorariaDiariaMinutos = 480,  
        CargaHorariaSemanaMinutos = 2640, 
        PermiteHoraExtra = true           
    },
    new TipoContrato 
    { 
        ContratoId = 2, 
        Nome = "Estágio", 
        CargaHorariaDiariaMinutos = 360,  
        CargaHorariaSemanaMinutos = 1800, 
        PermiteHoraExtra = false          
    },
    new TipoContrato 
    { 
        ContratoId = 3, 
        Nome = "Jovem Aprendiz", 
        CargaHorariaDiariaMinutos = 360,  
        CargaHorariaSemanaMinutos = 1800, 
        PermiteHoraExtra = false          
    }
);
    }
}