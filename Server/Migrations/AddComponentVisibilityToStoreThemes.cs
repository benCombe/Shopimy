using Microsoft.EntityFrameworkCore.Migrations;

namespace Server.Migrations
{
    public partial class AddComponentVisibilityToStoreThemes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "component_visibility",
                table: "StoreThemes",
                type: "nvarchar(max)",
                nullable: true,
                defaultValue: "{\"header\":true,\"hero\":true,\"featured\":true,\"categories\":true,\"testimonials\":true,\"newsletter\":true,\"footer\":true}");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "component_visibility",
                table: "StoreThemes");
        }
    }
} 