using Microsoft.AspNetCore.Identity;
using ShareLibrary.cs.Data.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShareLibrary.Data.Entities
{
    public class Profiles
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("UserId")]
        public Guid UserId { get; set; }

        [Required, MaxLength(50)]
        public string FirstName { get; set; } = null!;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = null!;

        // --- NEW FIELDS START ---

        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        // DateOnly is preferred for DOB to avoid timezone/time issues
        public DateTime? DateOfBirth { get; set; }

        // --- NEW FIELDS END ---

        public string? ProfileImageUrl { get; set; }

        public bool IsVerified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        public int BoostingPoints { get; set; } = 10000;
        public virtual ICollection<ServiceListings> Services { get; set; } = new List<ServiceListings>();
        public virtual ICollection<DocumentVerified> VerifiedDocuments { get; set; } = new List<DocumentVerified>();
        public virtual UserWallet? Wallet { get; set; }

        // Helper for UI
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}";

        // Inside Profiles.cs
        public virtual ICollection<Bookings> Bookings { get; set; } = new List<Bookings>();
    }
}