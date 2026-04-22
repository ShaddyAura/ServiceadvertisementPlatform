using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShareLibrary.cs.Data.Entities
{
    public class AccountSuspension
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ProfileId { get; set; }

        [Required, MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;

        public DateTime SuspendedAt { get; set; } = DateTime.UtcNow;

        // IsActive = true means the user is CURRENTLY suspended.
        // IsActive = false means the user was suspended in the past but is now restored.
        public bool IsActive { get; set; } = true;

        [ForeignKey("ProfileId")]
        public virtual Profiles Profile { get; set; } = null!;
    }
}
