namespace ServAd.UserDashboard.Entities
{
    public class ServiceMedia
    {
        public Guid MediaId { get; set; }
        public Guid ServiceId { get; set; }

        public string MediaUrl { get; set; } = null!;
        public string MediaType { get; set; } = null!; // Image / Video
    }
}
