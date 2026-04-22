using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareLibrary.cs.Migrations
{
    /// <inheritdoc />
    public partial class NewBookingpay : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "NetAmount",
                table: "BookingPayments",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PlatformFee",
                table: "BookingPayments",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NetAmount",
                table: "BookingPayments");

            migrationBuilder.DropColumn(
                name: "PlatformFee",
                table: "BookingPayments");
        }
    }
}
