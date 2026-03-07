using Microsoft.AspNetCore.Identity;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.Data.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ServAd.ApiService.Controllers.Account.Dto
{
    public sealed record RegisterUserRequestDto
    {
        private readonly Guid _id = Guid.NewGuid();

        // --- Basic Info ---
        [Required]
        [MaxLength(50)]
        public string FirstName { get; init; } = null!;

        [Required]
        [MaxLength(50)]
        public string LastName { get; init; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; init; } = null!;

        [Required]
        public string UserType { get; set; } = null!;

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; init; } = null!;

        [Compare(nameof(Password), ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; init; } = null!;

        // --- Convert to IdentityUser<Guid> ---
        public static implicit operator IdentityUser<Guid>(RegisterUserRequestDto dto) =>
            new()
            {
                Id = dto._id,
                UserName = dto.Email,
                Email = dto.Email,
                EmailConfirmed = false
            };

        // --- Convert to Profile entity ---
        public static implicit operator Profiles(RegisterUserRequestDto dto) =>
            new()
            {
                Id = dto._id,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                CreatedAt = DateTime.UtcNow,
                IsVerified = false
            };
    }
}
