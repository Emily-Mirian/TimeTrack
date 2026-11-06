using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 

namespace PontoOnline.Infrastructure.Migrations
{
    public partial class Inicial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Feriado",
                columns: table => new
                {
                    FeriadoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Data = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Descricao = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feriado", x => x.FeriadoId);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TipoContrato",
                columns: table => new
                {
                    ContratoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Nome = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CargaHorariaDiariaMinutos = table.Column<int>(type: "int", nullable: false),
                    CargaHorariaSemanaMinutos = table.Column<int>(type: "int", nullable: false),
                    PermiteHoraExtra = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoContrato", x => x.ContratoId);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Usuario",
                columns: table => new
                {
                    UsuarioId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    NomeCompleto = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SenhaHash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NivelAcesso = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IdTipoContrato = table.Column<int>(type: "int", nullable: false),
                    DataAdmissao = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuario", x => x.UsuarioId);
                    table.ForeignKey(
                        name: "FK_Usuario_TipoContrato_IdTipoContrato",
                        column: x => x.IdTipoContrato,
                        principalTable: "TipoContrato",
                        principalColumn: "ContratoId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "AuditoriaLog",
                columns: table => new
                {
                    LogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DataHora = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UsuarioResponsavelId = table.Column<int>(type: "int", nullable: false),
                    Acao = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Detalhes = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditoriaLog", x => x.LogId);
                    table.ForeignKey(
                        name: "FK_AuditoriaLog_Usuario_UsuarioResponsavelId",
                        column: x => x.UsuarioResponsavelId,
                        principalTable: "Usuario",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "AusenciaJustificada",
                columns: table => new
                {
                    AusenciaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DataInicio = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DataFim = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Motivo = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IdUsuario = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AusenciaJustificada", x => x.AusenciaId);
                    table.ForeignKey(
                        name: "FK_AusenciaJustificada_Usuario_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuario",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "FechamentoMensal",
                columns: table => new
                {
                    FechamentoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MesAno = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SaldoTotalMinutos = table.Column<int>(type: "int", nullable: false),
                    IdUsuario = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FechamentoMensal", x => x.FechamentoId);
                    table.ForeignKey(
                        name: "FK_FechamentoMensal_Usuario_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuario",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PreferenciaUsuario",
                columns: table => new
                {
                    PreferenciaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    AlertaEstagiario = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    AlertaAtestado = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ResumoPendencias = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    FormatoExportacao = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PreferenciaUsuario", x => x.PreferenciaId);
                    table.ForeignKey(
                        name: "FK_PreferenciaUsuario_Usuario_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuario",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RegistroPonto",
                columns: table => new
                {
                    PontoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DataRegistro = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Entrada1 = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    SaidaAlmoco = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    RetornoAlmoco = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Saida2 = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    SaldoDiarioMinutos = table.Column<int>(type: "int", nullable: true),
                    IdUsuario = table.Column<int>(type: "int", nullable: false),
                    IdFeriado = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistroPonto", x => x.PontoId);
                    table.ForeignKey(
                        name: "FK_RegistroPonto_Feriado_IdFeriado",
                        column: x => x.IdFeriado,
                        principalTable: "Feriado",
                        principalColumn: "FeriadoId");
                    table.ForeignKey(
                        name: "FK_RegistroPonto_Usuario_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuario",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "TipoContrato",
                columns: new[] { "ContratoId", "CargaHorariaDiariaMinutos", "CargaHorariaSemanaMinutos", "Nome", "PermiteHoraExtra" },
                values: new object[,]
                {
                    { 1, 0, 0, "CLT", false },
                    { 2, 0, 0, "Estágio", false },
                    { 3, 0, 0, "Jovem Aprendiz", false }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriaLog_UsuarioResponsavelId",
                table: "AuditoriaLog",
                column: "UsuarioResponsavelId");

            migrationBuilder.CreateIndex(
                name: "IX_AusenciaJustificada_IdUsuario",
                table: "AusenciaJustificada",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_FechamentoMensal_IdUsuario",
                table: "FechamentoMensal",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_PreferenciaUsuario_UsuarioId",
                table: "PreferenciaUsuario",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistroPonto_IdFeriado",
                table: "RegistroPonto",
                column: "IdFeriado");

            migrationBuilder.CreateIndex(
                name: "IX_RegistroPonto_IdUsuario",
                table: "RegistroPonto",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_IdTipoContrato",
                table: "Usuario",
                column: "IdTipoContrato");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditoriaLog");

            migrationBuilder.DropTable(
                name: "AusenciaJustificada");

            migrationBuilder.DropTable(
                name: "FechamentoMensal");

            migrationBuilder.DropTable(
                name: "PreferenciaUsuario");

            migrationBuilder.DropTable(
                name: "RegistroPonto");

            migrationBuilder.DropTable(
                name: "Feriado");

            migrationBuilder.DropTable(
                name: "Usuario");

            migrationBuilder.DropTable(
                name: "TipoContrato");
        }
    }
}
