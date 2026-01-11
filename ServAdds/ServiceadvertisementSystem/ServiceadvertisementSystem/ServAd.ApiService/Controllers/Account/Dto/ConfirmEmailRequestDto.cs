using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Account.Dto
{
    public sealed record ConfirmEmailRequestDto(
      [Required, EmailAddress] string Email,
      [Required] string Token
  );
}
