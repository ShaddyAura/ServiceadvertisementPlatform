using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ServAd.ApiService.Data.Entities
{
    public class Profiles
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("User")]
        public Guid UserId { get; set; }

        // -----------------------------
        // Basic User Info
        // -----------------------------
        [Required, MaxLength(50)]
        public string FirstName { get; set; } = null!;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = null!;

        // -----------------------------
        // Account State (Derived, not KYC logic)
        // -----------------------------
        public bool IsVerified { get; set; } = false;

        // -----------------------------
        // Audit
        // -----------------------------
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
