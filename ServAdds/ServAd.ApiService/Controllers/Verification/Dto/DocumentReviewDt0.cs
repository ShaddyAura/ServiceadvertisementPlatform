using ShareLibrary.cs.Data.Enums;
using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Verification.Dto
{
    public record DocumentReviewDto(
    [Required] VerificationStatus Status,
    string? AdminRemarks,
    [Required] Guid AdminId
);
}
