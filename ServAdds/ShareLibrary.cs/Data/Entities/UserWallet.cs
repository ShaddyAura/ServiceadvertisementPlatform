using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShareLibrary.cs.Data.Entities
{
    public class UserWallet
    {
        [Key]
        public Guid Id { get; set; }

        public Guid ProfileId { get; set; }
        [ForeignKey("ProfileId")]
        public virtual Profiles Profile { get; set; } = null!;

        // Points available to spend on Boosting
        public decimal PointsBalance { get; set; } = 0;

        // CRUCIAL: Only incremented by 'Purchase'. 
        // Spending points on Boosting does NOT decrease this.
        public decimal LifetimePurchasedPoints { get; set; } = 0;

        // Revenue from bookings
        public decimal ESewaBalance { get; set; } = 0;
        public decimal KhaltiBalance { get; set; } = 0;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}