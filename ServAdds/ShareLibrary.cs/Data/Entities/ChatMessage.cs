using ShareLibrary.Data.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShareLibrary.cs.Data.Entities
{
    public class ChatMessage
    {
        [Key]
        public Guid Id { get; set; }

        public Guid BookingId { get; set; }

        [ForeignKey("BookingId")]
        public virtual Bookings Booking { get; set; } = null!;

        // --- SENDER ---
        // Represents the ProfileId of the person who sent the message
        public Guid SenderProfileId { get; set; }

        [ForeignKey("SenderProfileId")]
        public virtual Profiles SenderProfile { get; set; } = null!;

        // --- RECEIVER ---
        // Represents the ProfileId of the person intended to receive the message
        public Guid ReceiverProfileId { get; set; }

        [ForeignKey("ReceiverProfileId")]
        public virtual Profiles ReceiverProfile { get; set; } = null!;

        public string MessageText { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}