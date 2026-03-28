using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShareLibrary.cs.Data.Entities
{
    public class Notification
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        // 1. The Recipient (Target) of the notification
        // This is the FK that determines which user sees the notification.
        public Guid ProfileId { get; set; }

        [ForeignKey("ProfileId")]
        public virtual Profiles Profile { get; set; } = null!;

        // 2. Reference IDs for the parties involved
        // These are stored for UI display or deep-linking logic.
        public Guid CustomerId { get; set; }
        public Guid ProviderId { get; set; }

        // Core content
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        // Where the user goes when they click (e.g., /bookings/{id})
        public string? ActionUrl { get; set; }

        // State & Timing
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? ReadAt { get; set; }

        // Optional: Store the raw JSON payload
        public string? Payload { get; set; }
    }
}