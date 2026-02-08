using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShareLibrary.cs.Data.Entities
{
    public class ChatMessage
    {
        [Key]
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        [ForeignKey("BookingId")]
        public virtual Bookings Booking { get; set; } = null!;

        public Guid SenderProfileId { get; set; }
        public string MessageText { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
