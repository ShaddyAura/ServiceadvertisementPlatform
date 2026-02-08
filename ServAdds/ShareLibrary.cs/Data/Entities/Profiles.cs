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

        //[ForeignKey("UserId")]
        //public  IdentityUser<Guid>? User { get; set; }

        [Required, MaxLength(50)]
        public string FirstName { get; set; } = null!;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = null!;

        // NEW: Property to store the path to the profile picture
        public string? ProfileImageUrl { get; set; }

        public bool IsVerified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        public int BoostingPoints { get; set; } = 0;
        public virtual ICollection<ServiceListings> Services { get; set; } = new List<ServiceListings>();
        public virtual ICollection<DocumentVerified> VerifiedDocuments { get; set; } = new List<DocumentVerified>();
        public virtual UserWallet? Wallet { get; set; }

        // Helper for UI
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}";
    }
}