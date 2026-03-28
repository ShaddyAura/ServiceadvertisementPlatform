using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareLibrary.cs.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLifetimePoints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "LifetimePoints",
                table: "Profiles",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LifetimePoints",
                table: "Profiles");
        }
    }
}
