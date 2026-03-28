using ShareLibrary.cs.Data.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Required for JsonIgnore

namespace ShareLibrary.cs.Data.Entities
{
    public class ServiceListings
    {
        [Key]
        public Guid Id { get; set; }

        public Guid ProfileId { get; set; }

        [ForeignKey("ProfileId")]
        [JsonIgnore] // 🔥 This prevents the "Object Cycle" error
        public virtual Profiles Profile { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }

        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public ServiceStatus Status { get; set; } = ServiceStatus.Active;

        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }

        public bool IsBoosted { get; set; } = false;

        // 🔥 Use ENUM instead of int
        public BoostLevel BoostLevel { get; set; } = BoostLevel.None;
        public DateTime? BoostExpiry { get; set; }

        // 🔥 Computed Property (NOT mapped to DB)
        [NotMapped]
        public bool IsCurrentlyBoosted =>
            BoostLevel != BoostLevel.None &&
            BoostExpiry.HasValue &&
            BoostExpiry > DateTime.UtcNow;

        [JsonIgnore]
        public virtual ICollection<Bookings> Bookings { get; set; } = new List<Bookings>();
    }
}