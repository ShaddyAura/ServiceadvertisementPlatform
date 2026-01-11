using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Account.Dto
{
        public sealed record GoogleAuthCodeDto(
                
                [Required(ErrorMessage = "Authorization code is required.")]
            string Code
        );
    
}
