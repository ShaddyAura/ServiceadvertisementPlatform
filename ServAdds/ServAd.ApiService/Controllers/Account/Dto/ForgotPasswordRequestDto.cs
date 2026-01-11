using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Account.Dto
{
    public sealed record ForgotPasswordRequestDto(
        [Required, EmailAddress] string Email
    );
}
