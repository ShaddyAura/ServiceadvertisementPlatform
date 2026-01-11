namespace ServAd.UserDashboard.Entities
{
    public class Message
    {
        public Guid MessageId { get; set; }
        public Guid RoomId { get; set; }
        public Guid SenderId { get; set; }

        public string Content { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
