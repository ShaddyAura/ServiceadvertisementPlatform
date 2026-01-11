using System.ComponentModel.DataAnnotations.Schema;

namespace ServAd.UserDashboard.Entities
{
    public class Notification
    {
        public Guid NotificationId { get; set; }

        [ForeignKey("User")]
         public Guid UserId { get; set; }

        public string Type { get; set; } = null!;
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; }
    }
}
