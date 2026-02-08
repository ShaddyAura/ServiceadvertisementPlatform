using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServAd.UserDashboard.Data.Entities
{
    public class ChatMessage
    {
        [Key]
        public Guid Id { get; set; }

        public Guid BookingId { get; set; } 
        public virtual Booking Booking { get; set; }

        public Guid SenderProfileId { get; set; }
        public string MessageText { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
