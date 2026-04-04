using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareLibrary.cs.Migrations
{
    /// <inheritdoc />
    public partial class AddSuspensionToProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSuspended",
                table: "Profiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SuspensionReason",
                table: "Profiles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSuspended",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "SuspensionReason",
                table: "Profiles");
        }
    }
}
