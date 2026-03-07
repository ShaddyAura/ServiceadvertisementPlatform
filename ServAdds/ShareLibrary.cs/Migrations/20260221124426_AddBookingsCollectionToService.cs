using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareLibrary.cs.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingsCollectionToService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Profiles_ProfileId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_ServiceListings_ServiceId",
                table: "Bookings");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Profiles_ProfileId",
                table: "Bookings",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_ServiceListings_ServiceId",
                table: "Bookings",
                column: "ServiceId",
                principalTable: "ServiceListings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Profiles_ProfileId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_ServiceListings_ServiceId",
                table: "Bookings");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Profiles_ProfileId",
                table: "Bookings",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_ServiceListings_ServiceId",
                table: "Bookings",
                column: "ServiceId",
                principalTable: "ServiceListings",
                principalColumn: "Id");
        }
    }
}
