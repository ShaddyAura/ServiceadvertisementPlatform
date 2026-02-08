using StructureMap;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServAd.UserDashboard.Data.Entities
{
    // Data/Entities/UserWallet.cs
    public class UserWallet
    {
        [Key]
        public Guid Id { get; set; }

        public Guid ProfileId { get; set; } // Link to Profiles
        public virtual Profiles User { get; set; }

        public int PointsBalance { get; set; } // For Boosting
        public decimal CashBalance { get; set; } // Earned from bookings
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
