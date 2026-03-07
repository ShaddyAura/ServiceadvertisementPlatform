using ShareLibrary.cs.Data.Enums;
using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Verification.Dto
{
    public class DocumentReviewDto
    {
        public VerificationStatus Status { get; set; }
        public string? Message { get; set; } // This is the "Admin Remarks"
    }
}