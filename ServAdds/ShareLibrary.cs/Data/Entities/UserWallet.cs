using ShareLibrary.Data.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShareLibrary.cs.Data.Entities
{
    public class UserWallet
    {
        [Key]
        public Guid Id { get; set; }
        public Guid ProfileId { get; set; }
        [ForeignKey("ProfileId")]
        public virtual Profiles Profile { get; set; } = null!;

        public int PointsBalance { get; set; } = 0; // For Boosting

        // Revenue from bookings
        public decimal eSewaBalance { get; set; } = 0;
        public decimal KhaltiBalance { get; set; } = 0;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
