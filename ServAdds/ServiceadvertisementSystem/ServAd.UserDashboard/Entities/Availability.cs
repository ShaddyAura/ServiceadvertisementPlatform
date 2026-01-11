using System.ComponentModel.DataAnnotations.Schema;

namespace ServAd.UserDashboard.Entities
{
    public class Availability
    {
        public Guid AvailabilityId { get; set; }

        [ForeignKey("Service")]
        public Guid ServiceId { get; set; }

        public string DayOfWeek { get; set; } = null!;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}
