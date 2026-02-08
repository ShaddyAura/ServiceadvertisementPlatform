
using StructureMap;
using System.ComponentModel.DataAnnotations;
using static ServAd.UserDashboard.Enums.DashboardEnums;


namespace ServAd.UserDashboard.Data.Entities
{
    public class VerificationDocument
    {
        [Key]
        public Guid Id { get; set; }

        public Guid ProfileId { get; set; } 
        public virtual Profiles User { get; set; }

        public string DocumentUrl { get; set; }
        public DocumentType Type { get; set; } // Enum: Citizenship, License
        public VerificationStatus Status { get; set; } = VerificationStatus.Pending;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
