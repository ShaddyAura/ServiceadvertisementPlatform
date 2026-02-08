using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static ServAd.UserDashboard.Enums.DashboardEnums;

namespace ServAd.UserDashboard.Data.Entities
{
    // Data/Entities/Booking.cs
    public class Booking
    {
        [Key]
        public Guid Id { get; set; }

        public Guid ServiceId { get; set; }
        public virtual ServiceListing Service { get; set; }

        public Guid CustomerProfileId { get; set; } // The user buying
        public Guid ProviderProfileId { get; set; } // The user selling

        public DateTime BookingDate { get; set; }
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
    }

    
}
