using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShareLibrary.cs.Data.Entities
{
    public class BookingPayment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid BookingId { get; set; }

        [ForeignKey("BookingId")]
        public virtual Bookings Booking { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; } // Total paid by customer

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PlatformFee { get; set; } // Amount taken by platform

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetAmount { get; set; } // Amount for the provider

        [Required]
        [MaxLength(50)]
        public string Gateway { get; set; } = string.Empty; // "esewa" or "khalti"

        public Guid ProviderProfileId { get; set; }
        public Guid CustomerProfileId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
