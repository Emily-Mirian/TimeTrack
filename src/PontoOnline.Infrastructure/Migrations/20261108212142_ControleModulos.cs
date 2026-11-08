using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PontoOnline.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ControleModulos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ModuloEdicaoPonto",
                table: "configuracoesglobais",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "ModuloExportacao",
                table: "configuracoesglobais",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "ModuloImportacao",
                table: "configuracoesglobais",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModuloEdicaoPonto",
                table: "configuracoesglobais");

            migrationBuilder.DropColumn(
                name: "ModuloExportacao",
                table: "configuracoesglobais");

            migrationBuilder.DropColumn(
                name: "ModuloImportacao",
                table: "configuracoesglobais");
        }
    }
}
