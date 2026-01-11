using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Account.Dto
{
    public sealed record ResetPasswordRequestDto(
        [Required, EmailAddress] string Email,
        [Required] string ResetCode,
    [Required, MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")] string NewPassword
    );
}
