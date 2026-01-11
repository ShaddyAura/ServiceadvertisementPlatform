using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Account.Dto
{
    public sealed record LoginRequestDto(
        [Required, EmailAddress] string Email,
        [Required] string Password
    );
}
