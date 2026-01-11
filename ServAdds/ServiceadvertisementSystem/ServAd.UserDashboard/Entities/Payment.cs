using System.ComponentModel.DataAnnotations.Schema;

namespace ServAd.UserDashboard.Entities
{
    public class Payment
    {
        public Guid PaymentId { get; set; }

        [ForeignKey("Booking")]
        public Guid BookingId { get; set; }

        public decimal Amount { get; set; }
        public string Gateway { get; set; } = null!; // eSewa / Khalti
        public string TransactionRef { get; set; } = null!;
    }
}
