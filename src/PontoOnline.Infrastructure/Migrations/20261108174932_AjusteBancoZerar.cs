using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PontoOnline.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjusteBancoZerar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Departamento",
                table: "Usuario",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "PermiteBancoHoras",
                table: "TipoContrato",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ToleranciaMinutos",
                table: "TipoContrato",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Feriado",
                type: "varchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Tipo",
                table: "Feriado",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "configuracoesglobais",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ExpiracaoSessao = table.Column<int>(type: "int", nullable: false),
                    SenhaForte = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    FrequenciaBackup = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_configuracoesglobais", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "logsistema",
                columns: table => new
                {
                    LogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DataHora = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Usuario = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Nivel = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Acao = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Modulo = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Detalhes = table.Column<string>(type: "text", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_logsistema", x => x.LogId);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "permissoesperfil",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Funcao = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Perfil = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Ativo = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permissoesperfil", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "TipoContrato",
                keyColumn: "ContratoId",
                keyValue: 1,
                columns: new[] { "CargaHorariaDiariaMinutos", "CargaHorariaSemanaMinutos", "PermiteBancoHoras", "PermiteHoraExtra", "ToleranciaMinutos" },
                values: new object[] { 480, 2640, true, true, 10 });

            migrationBuilder.UpdateData(
                table: "TipoContrato",
                keyColumn: "ContratoId",
                keyValue: 2,
                columns: new[] { "CargaHorariaDiariaMinutos", "CargaHorariaSemanaMinutos", "PermiteBancoHoras", "ToleranciaMinutos" },
                values: new object[] { 360, 1800, true, 10 });

            migrationBuilder.UpdateData(
                table: "TipoContrato",
                keyColumn: "ContratoId",
                keyValue: 3,
                columns: new[] { "CargaHorariaDiariaMinutos", "CargaHorariaSemanaMinutos", "PermiteBancoHoras", "ToleranciaMinutos" },
                values: new object[] { 360, 1800, true, 10 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "configuracoesglobais");

            migrationBuilder.DropTable(
                name: "logsistema");

            migrationBuilder.DropTable(
                name: "permissoesperfil");

            migrationBuilder.DropColumn(
                name: "Departamento",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "PermiteBancoHoras",
                table: "TipoContrato");

            migrationBuilder.DropColumn(
                name: "ToleranciaMinutos",
                table: "TipoContrato");

            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Feriado");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Feriado",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(150)",
                oldMaxLength: 150)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "TipoContrato",
                keyColumn: "ContratoId",
                keyValue: 1,
                columns: new[] { "CargaHorariaDiariaMinutos", "CargaHorariaSemanaMinutos", "PermiteHoraExtra" },
                values: new object[] { 0, 0, false });

            migrationBuilder.UpdateData(
                table: "TipoContrato",
                keyColumn: "ContratoId",
                keyValue: 2,
                columns: new[] { "CargaHorariaDiariaMinutos", "CargaHorariaSemanaMinutos" },
                values: new object[] { 0, 0 });

            migrationBuilder.UpdateData(
                table: "TipoContrato",
                keyColumn: "ContratoId",
                keyValue: 3,
                columns: new[] { "CargaHorariaDiariaMinutos", "CargaHorariaSemanaMinutos" },
                values: new object[] { 0, 0 });
        }
    }
}
