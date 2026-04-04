using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShareLibrary.cs.Data.Entities
{
    public class UserRewardHistory
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ProfileId { get; set; }

        [ForeignKey("ProfileId")]
        public Profiles Profile { get; set; }

        [Required]
        [MaxLength(100)]
        public string RewardType { get; set; } // e.g., "DailyLogin", "WatchVideo"

        [Column(TypeName = "decimal(18,2)")]
        public decimal PointsEarned { get; set; } = 0;

        // --- NEW FIELDS FOR BOOKING PAYMENTS ---

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; } = 0;

        public Guid? BookingId { get; set; }

        [ForeignKey("BookingId")]
        public virtual Bookings? Booking { get; set; }

        // ---------------------------------------

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
