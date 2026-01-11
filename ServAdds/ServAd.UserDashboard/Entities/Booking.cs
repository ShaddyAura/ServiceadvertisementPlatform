namespace ServAd.UserDashboard.Entities
{
    public class Booking
    {
        public Guid BookingId { get; set; }

        public Guid CustomerId { get; set; }

        
        public Guid ServiceId { get; set; }

        public DateTime BookingDate { get; set; }
        public string Status { get; set; } = "Pending";
    }
}
