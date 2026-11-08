using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PontoOnline.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AlertasJornadaModulo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ModuloAlertasJornada",
                table: "configuracoesglobais",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModuloAlertasJornada",
                table: "configuracoesglobais");
        }
    }
}
