using ServAd.ApiService.Data.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ServAd.ApiService.Data.Entities
{
    public class Profiles
    {
        [Key]
        public Guid Id { get; set; }

        // Link to AspNet Identity User
        [ForeignKey("User")]
        public Guid UserId { get; set; }

        // -----------------------------
        // Basic User Info
        // -----------------------------
        [Required, MaxLength(50)]
        public string FirstName { get; set; } = null!;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = null!;

        // -----------------------------
        // Identity Document Images
        // -----------------------------
        [MaxLength(300)]
        public string? CitizenshipDocumentUrl { get; set; }

        [MaxLength(300)]
        public string? PassportDocumentUrl { get; set; }

        [MaxLength(300)]
        public string? NINDocumentUrl { get; set; }

        // -----------------------------
        // Identity Document Metadata
        // -----------------------------
        public DocumentType? UploadedDocumentType { get; set; }

        [MaxLength(100)]
        public string? UploadedDocumentNumber { get; set; }

        public DateTime? DocumentExpiryDate { get; set; }

        // -----------------------------
        // Verification
        // -----------------------------
        public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;

        public bool IsVerified { get; set; } = false;

        public DateTime? VerificationDate { get; set; }

        public Guid? VerifierAdminId { get; set; }

        // -----------------------------
        // Audit Fields
        // -----------------------------
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
