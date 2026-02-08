using Microsoft.AspNetCore.Http;
using ShareLibrary.cs.Data.Enums;
using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Verification.Dto
{
    public record DocumentSubmitDto(
        [Required] Guid ProfileId,
        [Required] DocumentType DocumentType,
        [Required] string DocumentNumber,

        // Split into Front and Back files
        [Required] IFormFile DocumentFrontSide,
        [Required] IFormFile DocumentBackSide,

        DateTime? ExpiryDate
    );
}