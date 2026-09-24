using Microsoft.EntityFrameworkCore;
using PontoOnline.Domain.Entities;

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
            .HasOne(rp => rp.Feriado)
            .WithMany(f => f.RegistrosPonto)
            .HasForeignKey(rp => rp.IdFeriado)
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
    }
}