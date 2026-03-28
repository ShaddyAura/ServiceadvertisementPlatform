
using ShareLibrary.cs.Data.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShareLibrary.cs.Data.Entities
{
    public class DocumentVerified
    {
        [Key]
        public Guid Id { get; set; }

        // Link to the Profile being verified
        public Guid ProfileId { get; set; }

        [ForeignKey("ProfileId")]
        public virtual Profiles Profile { get; set; } = null!;

        // Document Details
        [Required]
        public DocumentType DocumentType { get; set; }

        [Required]
        public string DocumentFrontSideUrl { get; set; } = string.Empty;

        [Required]
        public string DocumentBackSideUrl { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? DocumentNumber { get; set; } 

        public VerificationStatus Status { get; set; } = VerificationStatus.Pending;

        // Audit Fields
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public DateTime? VerifiedAt { get; set; }

        public string? Message { get; set; }
    }
}