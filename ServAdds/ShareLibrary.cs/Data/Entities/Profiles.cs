using Microsoft.AspNetCore.Identity;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ShareLibrary.cs.Data.Entities
{
    public class Profiles
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("UserId")]
        public Guid UserId { get; set; }

        [Required, MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

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

        public bool IsSuspended { get; set; } = false;
        public string? SuspensionReason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        public decimal BoostingPoints { get; set; } 
        public decimal LifetimePoints { get; set; }
        public virtual ICollection<ServiceListings> Services { get; set; } = [];
        public virtual ICollection<DocumentVerified> VerifiedDocuments { get; set; } = [];
        public virtual UserWallet? Wallet { get; set; }

        // Helper for UI
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}";

        [JsonIgnore]
        public virtual ICollection<Bookings> Bookings { get; set; } = [];
    }
}
