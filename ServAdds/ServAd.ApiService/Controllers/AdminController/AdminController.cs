using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Services.Admin_Features.Interface;
using ServAd.ApiService.Services.Notifications.Services;

namespace ServAd.ApiService.Controllers.AdminController
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin")]
    public class AdminController(IAdminService adminService, INotificationService notify) : ControllerBase
    {
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats() => Ok(await adminService.GetAdminStatsAsync());

        [HttpPost("verify/{profileId}")]
        public async Task<IActionResult> VerifyProvider(Guid profileId, [FromQuery] string email)
        {
            await adminService.VerifyUserDocumentAsync(profileId);
            await notify.NotifyDocumentVerified(profileId, email);
            return Ok(new { Message = "Provider Verified and Notified" });
        }

        [HttpGet("finances")]
        public async Task<IActionResult> GetWalletStats() => Ok(await adminService.GetFinancialOverviewAsync());

        [HttpGet("boosting-logs")]
        public async Task<IActionResult> GetBoosts() => Ok(await adminService.GetBoostingHistoryAsync());
    }
}
