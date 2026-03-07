using Microsoft.AspNetCore.Http;
using ShareLibrary.cs.Data.Enums;
using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Verification.Dto
{
    public record DocumentSubmitDto(
         Guid ProfileId,
        DocumentType DocumentType,
        string DocumentNumber,
        IFormFile DocumentFrontSide,
        IFormFile DocumentBackSide

    );
}