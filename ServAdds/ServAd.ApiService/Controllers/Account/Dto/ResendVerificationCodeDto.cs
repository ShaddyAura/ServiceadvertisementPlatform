using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Account.Dto
{
    public sealed record ResendVerificationCodeDto(
        [Required, EmailAddress] string Email
    );
}
