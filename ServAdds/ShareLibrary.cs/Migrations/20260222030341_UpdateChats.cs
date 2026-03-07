using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareLibrary.cs.Migrations
{
    /// <inheritdoc />
    public partial class UpdateChats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Profiles_ProfileId",
                table: "ChatMessages");

            migrationBuilder.RenameColumn(
                name: "ProfileId",
                table: "ChatMessages",
                newName: "SenderProfileId");

            migrationBuilder.RenameIndex(
                name: "IX_ChatMessages_ProfileId",
                table: "ChatMessages",
                newName: "IX_ChatMessages_SenderProfileId");

            migrationBuilder.AddColumn<Guid>(
                name: "ReceiverProfileId",
                table: "ChatMessages",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ReceiverProfileId",
                table: "ChatMessages",
                column: "ReceiverProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Profiles_ReceiverProfileId",
                table: "ChatMessages",
                column: "ReceiverProfileId",
                principalTable: "Profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Profiles_SenderProfileId",
                table: "ChatMessages",
                column: "SenderProfileId",
                principalTable: "Profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Profiles_ReceiverProfileId",
                table: "ChatMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Profiles_SenderProfileId",
                table: "ChatMessages");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_ReceiverProfileId",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "ReceiverProfileId",
                table: "ChatMessages");

            migrationBuilder.RenameColumn(
                name: "SenderProfileId",
                table: "ChatMessages",
                newName: "ProfileId");

            migrationBuilder.RenameIndex(
                name: "IX_ChatMessages_SenderProfileId",
                table: "ChatMessages",
                newName: "IX_ChatMessages_ProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Profiles_ProfileId",
                table: "ChatMessages",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id");
        }
    }
}
