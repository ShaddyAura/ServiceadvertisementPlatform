using System.ComponentModel.DataAnnotations.Schema;

namespace ServAd.UserDashboard.Entities
{
    public class Review
    {
        public Guid ReviewId { get; set; }

        [ForeignKey("Booking")]
        public Guid BookingId { get; set; }

        public Guid CustomerId { get; set; }

        public int Rating { get; set; } // 1–5
        public string Comment { get; set; } = null!;
    }
}
