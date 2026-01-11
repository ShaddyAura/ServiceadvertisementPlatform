using ServAd.ApiService.Data.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServAd.UserDashboard.Entities
{
    public class VerificationDocument
    {
        [Key]
        public Guid Id { get; set; }

        // FK → AspNetUsers.Id
        [Required]
        public Guid UserId { get; set; }

        public DocumentType DocumentType { get; set; }

        [Required]
        public string DocumentUrl { get; set; } = null!;

        public VerificationStatus Status { get; set; }

        public DateTime UploadedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }

        public Guid? ReviewedByAdminId { get; set; }
    }
}
