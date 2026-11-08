using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PontoOnline.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AnexoAtestado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Anexo",
                table: "AusenciaJustificada",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Anexo",
                table: "AusenciaJustificada");
        }
    }
}
