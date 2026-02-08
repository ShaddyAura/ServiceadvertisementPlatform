using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShareLibrary.Data.Entities
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

        // UPDATED: Split single URL into Front and Back sides
        [Required]
        public string DocumentFrontSideUrl { get; set; } = string.Empty;

        [Required]
        public string DocumentBackSideUrl { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? DocumentNumber { get; set; } // ID number on the card

        // Verification Logic
        public VerificationStatus Status { get; set; } = VerificationStatus.Pending;

        public string? AdminRemarks { get; set; } // Reason for rejection if applicable

        public DateTime? ExpiryDate { get; set; }

        // Audit Fields
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public Guid? VerifiedByAdminId { get; set; } // Reference to admin who reviewed it

        public DateTime? VerifiedAt { get; set; }
    }
}