using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;
using ShareLibrary.Data.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

public class Bookings
{
    [Key]
    public Guid Id { get; set; }

    // --- Link to Service ---
    public Guid ServiceId { get; set; }
    [ForeignKey("ServiceId")]
    public virtual ServiceListings Service { get; set; } = null!;

    // --- Link to Customer (The person booking) ---
    public Guid ProfileId { get; set; }
    [ForeignKey("ProfileId")]
    [JsonIgnore]
    public virtual Profiles Profile { get; set; } = null!;

    // --- Link to Provider (The person performing the service) ---
    public Guid ProviderProfileId { get; set; }

    // Optional: Add a navigation property if you want to load Provider details later
    // [ForeignKey("ProviderProfileId")]
    // [JsonIgnore]
    // public virtual Profiles Provider { get; set; } = null!;

    [Required]
    public decimal AgreedPrice { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    [Required]
    public DateTime ScheduledStart { get; set; }

    [Required]
    public DateTime ScheduledEnd { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}