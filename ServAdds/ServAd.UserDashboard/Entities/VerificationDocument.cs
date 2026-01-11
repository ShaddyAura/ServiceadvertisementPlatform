using ServAd.ApiService.Data.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace ServAd.UserDashboard.Entities
{
    public class VerificationDocument
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public DocumentType DocumentType { get; set; }

        [Required]
        public string DocumentUrl { get; set; } = null!;

        public VerificationStatus Status { get; set; } = VerificationStatus.Pending;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }

        public Guid? ReviewedByAdminId { get; set; }
    }
}
