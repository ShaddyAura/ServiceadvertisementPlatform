using ShareLibrary.cs.Data.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShareLibrary.cs.Data.Entities
{
    public class Bookings
    {
        [Key]
        public Guid Id { get; set; }
        public Guid ServiceId { get; set; }

        [ForeignKey("ServiceId")]
        public virtual ServiceListings Service { get; set; } = null!;

        public Guid CustomerProfileId { get; set; } 
        public Guid ProviderProfileId { get; set; }

        public BookingStatus Status { get; set; } = BookingStatus.Pending;
        public DateTime ScheduledAt { get; set; }
    }

}
