using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ShareLibrary.cs.Data.Entities
{
    public class ProviderContact
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("ProfileId")]
        public Guid ProfileId { get; set; }

        [JsonIgnore]
        public virtual Profiles Profile { get; set; } = null!;

        [Required, MaxLength(100)]
        public string ProviderName { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string MobileNo { get; set; } = string.Empty;

        [Required, MaxLength(250)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(100)]
        public string? OperatingHours { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
