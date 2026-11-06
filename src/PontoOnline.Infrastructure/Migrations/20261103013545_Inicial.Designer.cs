using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PontoOnline.Infrastructure.Context;

#nullable disable

namespace PontoOnline.Infrastructure.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20261103013545_Inicial")]
    partial class Inicial
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            MySqlModelBuilderExtensions.AutoIncrementColumns(modelBuilder);

            modelBuilder.Entity("PontoOnline.Domain.Entities.AuditoriaLog", b =>
                {
                    b.Property<int>("LogId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("LogId"));

                    b.Property<string>("Acao")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<DateTime>("DataHora")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Detalhes")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int>("UsuarioResponsavelId")
                        .HasColumnType("int");

                    b.HasKey("LogId");

                    b.HasIndex("UsuarioResponsavelId");

                    b.ToTable("AuditoriaLog", (string)null);
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.AusenciaJustificada", b =>
                {
                    b.Property<int>("AusenciaId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("AusenciaId"));

                    b.Property<DateTime>("DataFim")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("DataInicio")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("IdUsuario")
                        .HasColumnType("int");

                    b.Property<string>("Motivo")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("Status")
                        .HasColumnType("longtext");

                    b.HasKey("AusenciaId");

                    b.HasIndex("IdUsuario");

                    b.ToTable("AusenciaJustificada", (string)null);
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.FechamentoMensal", b =>
                {
                    b.Property<int>("FechamentoId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("FechamentoId"));

                    b.Property<int>("IdUsuario")
                        .HasColumnType("int");

                    b.Property<string>("MesAno")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int>("SaldoTotalMinutos")
                        .HasColumnType("int");

                    b.HasKey("FechamentoId");

                    b.HasIndex("IdUsuario");

                    b.ToTable("FechamentoMensal", (string)null);
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.Feriado", b =>
                {
                    b.Property<int>("FeriadoId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("FeriadoId"));

                    b.Property<DateTime>("Data")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Descricao")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("FeriadoId");

                    b.ToTable("Feriado", (string)null);
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.PreferenciaUsuario", b =>
                {
                    b.Property<int>("PreferenciaId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("PreferenciaId"));

                    b.Property<bool>("AlertaAtestado")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("AlertaEstagiario")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("FormatoExportacao")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<bool>("ResumoPendencias")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("UsuarioId")
                        .HasColumnType("int");

                    b.HasKey("PreferenciaId");

                    b.HasIndex("UsuarioId");

                    b.ToTable("PreferenciaUsuario", (string)null);
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.RegistroPonto", b =>
                {
                    b.Property<int>("PontoId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("PontoId"));

                    b.Property<DateTime>("DataRegistro")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("Entrada1")
                        .HasColumnType("datetime(6)");

                    b.Property<int?>("IdFeriado")
                        .HasColumnType("int");

                    b.Property<int>("IdUsuario")
                        .HasColumnType("int");

                    b.Property<DateTime?>("RetornoAlmoco")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("Saida2")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("SaidaAlmoco")
                        .HasColumnType("datetime(6)");

                    b.Property<int?>("SaldoDiarioMinutos")
                        .HasColumnType("int");

                    b.HasKey("PontoId");

                    b.HasIndex("IdFeriado");

                    b.HasIndex("IdUsuario");

                    b.ToTable("RegistroPonto", (string)null);
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.TipoContrato", b =>
                {
                    b.Property<int>("ContratoId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("ContratoId"));

                    b.Property<int>("CargaHorariaDiariaMinutos")
                        .HasColumnType("int");

                    b.Property<int>("CargaHorariaSemanaMinutos")
                        .HasColumnType("int");

                    b.Property<string>("Nome")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<bool>("PermiteHoraExtra")
                        .HasColumnType("tinyint(1)");

                    b.HasKey("ContratoId");

                    b.ToTable("TipoContrato", (string)null);

                    b.HasData(
                        new
                        {
                            ContratoId = 1,
                            CargaHorariaDiariaMinutos = 0,
                            CargaHorariaSemanaMinutos = 0,
                            Nome = "CLT",
                            PermiteHoraExtra = false
                        },
                        new
                        {
                            ContratoId = 2,
                            CargaHorariaDiariaMinutos = 0,
                            CargaHorariaSemanaMinutos = 0,
                            Nome = "Estágio",
                            PermiteHoraExtra = false
                        },
                        new
                        {
                            ContratoId = 3,
                            CargaHorariaDiariaMinutos = 0,
                            CargaHorariaSemanaMinutos = 0,
                            Nome = "Jovem Aprendiz",
                            PermiteHoraExtra = false
                        });
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.Usuario", b =>
                {
                    b.Property<int>("UsuarioId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("UsuarioId"));

                    b.Property<DateTime>("DataAdmissao")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int>("IdTipoContrato")
                        .HasColumnType("int");

                    b.Property<string>("NivelAcesso")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("NomeCompleto")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("SenhaHash")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("UsuarioId");

                    b.HasIndex("IdTipoContrato");

                    b.ToTable("Usuario", (string)null);
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.AuditoriaLog", b =>
                {
                    b.HasOne("PontoOnline.Domain.Entities.Usuario", "UsuarioResponsavel")
                        .WithMany()
                        .HasForeignKey("UsuarioResponsavelId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("UsuarioResponsavel");
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.AusenciaJustificada", b =>
                {
                    b.HasOne("PontoOnline.Domain.Entities.Usuario", "Usuario")
                        .WithMany("AusenciasJustificadas")
                        .HasForeignKey("IdUsuario")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Usuario");
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.FechamentoMensal", b =>
                {
                    b.HasOne("PontoOnline.Domain.Entities.Usuario", "Usuario")
                        .WithMany("FechamentosMensais")
                        .HasForeignKey("IdUsuario")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Usuario");
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.PreferenciaUsuario", b =>
                {
                    b.HasOne("PontoOnline.Domain.Entities.Usuario", "Usuario")
                        .WithMany()
                        .HasForeignKey("UsuarioId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Usuario");
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.RegistroPonto", b =>
                {
                    b.HasOne("PontoOnline.Domain.Entities.Feriado", "Feriado")
                        .WithMany("RegistrosPonto")
                        .HasForeignKey("IdFeriado");

                    b.HasOne("PontoOnline.Domain.Entities.Usuario", "Usuario")
                        .WithMany("RegistrosPonto")
                        .HasForeignKey("IdUsuario")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Feriado");

                    b.Navigation("Usuario");
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.Usuario", b =>
                {
                    b.HasOne("PontoOnline.Domain.Entities.TipoContrato", "TipoContrato")
                        .WithMany("Usuarios")
                        .HasForeignKey("IdTipoContrato")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("TipoContrato");
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.Feriado", b =>
                {
                    b.Navigation("RegistrosPonto");
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.TipoContrato", b =>
                {
                    b.Navigation("Usuarios");
                });

            modelBuilder.Entity("PontoOnline.Domain.Entities.Usuario", b =>
                {
                    b.Navigation("AusenciasJustificadas");

                    b.Navigation("FechamentosMensais");

                    b.Navigation("RegistrosPonto");
                });
#pragma warning restore 612, 618
        }
    }
}
