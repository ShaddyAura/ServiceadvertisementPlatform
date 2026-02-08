using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareLibrary.cs.Migrations
{
    /// <inheritdoc />
    public partial class Adddocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DocumentUrl",
                table: "DocumentVerifieds",
                newName: "DocumentFrontSideUrl");

            migrationBuilder.AddColumn<string>(
                name: "DocumentBackSideUrl",
                table: "DocumentVerifieds",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentBackSideUrl",
                table: "DocumentVerifieds");

            migrationBuilder.RenameColumn(
                name: "DocumentFrontSideUrl",
                table: "DocumentVerifieds",
                newName: "DocumentUrl");
        }
    }
}
