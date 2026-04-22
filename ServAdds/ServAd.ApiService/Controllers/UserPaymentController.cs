using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Services.UserPayment.Interface;
using System.Security.Claims;

namespace ServAd.ApiService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserPaymentController(IUserPaymentService paymentService) : ControllerBase
    {
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var profileIdStr = User.FindFirst("ProfileId")?.Value 
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (profileIdStr == null || !Guid.TryParse(profileIdStr, out var profileId))
                return Unauthorized();

            var history = await paymentService.GetUserPaymentHistoryAsync(profileId);
            return Ok(history);
        }

        [HttpGet("provider-earnings")]
        public async Task<IActionResult> GetProviderEarnings()
        {
            var profileIdStr = User.FindFirst("ProfileId")?.Value 
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (profileIdStr == null || !Guid.TryParse(profileIdStr, out var profileId))
                return Unauthorized();

            var earnings = await paymentService.GetProviderEarningsAsync(profileId);
            return Ok(earnings);
        }
    }
}
