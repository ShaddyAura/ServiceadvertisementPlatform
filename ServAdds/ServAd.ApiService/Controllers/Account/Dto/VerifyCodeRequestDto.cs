using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Account.Dto
{
    public sealed record VerifyCodeRequestDto(
        [Required, EmailAddress] string Email,
        [Required, MinLength(6), MaxLength(6)] string Code
    );
}
