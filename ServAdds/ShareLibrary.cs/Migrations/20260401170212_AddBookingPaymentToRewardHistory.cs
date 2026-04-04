using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareLibrary.cs.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingPaymentToRewardHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "UserRewardHistories",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "BookingId",
                table: "UserRewardHistories",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRewardHistories_BookingId",
                table: "UserRewardHistories",
                column: "BookingId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRewardHistories_Bookings_BookingId",
                table: "UserRewardHistories",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRewardHistories_Bookings_BookingId",
                table: "UserRewardHistories");

            migrationBuilder.DropIndex(
                name: "IX_UserRewardHistories_BookingId",
                table: "UserRewardHistories");

            migrationBuilder.DropColumn(
                name: "Amount",
                table: "UserRewardHistories");

            migrationBuilder.DropColumn(
                name: "BookingId",
                table: "UserRewardHistories");
        }
    }
}
