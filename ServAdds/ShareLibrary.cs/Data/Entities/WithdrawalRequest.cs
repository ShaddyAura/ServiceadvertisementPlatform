using ShareLibrary.cs.Data.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShareLibrary.cs.Data.Entities
{
    public class WithdrawalRequest
    {
        [Key]
        public Guid Id { get; set; }

        public Guid ProfileId { get; set; }
        [ForeignKey("ProfileId")]
        public virtual Profiles Profile { get; set; } = null!;

        public decimal Amount { get; set; }
        
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty; // "eSewa" or "Khalti"

        [MaxLength(200)]
        public string AccountDetails { get; set; } = string.Empty; // e.g. Phone number

        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // "Pending", "Approved", "Rejected"

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessedAt { get; set; }
    }
}
