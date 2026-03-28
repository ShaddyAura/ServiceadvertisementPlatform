using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.UserEngagement.Interface;
using ShareLibrary.cs.Data.Entities;
using System;
using System.Threading.Tasks;

namespace ServAd.ApiService.Controllers.UserEngagement
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserEngagementController(IUserEngagementService engagementService) : ControllerBase
    {
        [HttpPost("claim-daily-reward")]
        public async Task<IActionResult> ClaimDailyReward([FromBody] ClaimUserRewardDto dto)
        {
            try
            {
                var profile = await engagementService.ClaimDailyLoginRewardAsync(dto.ProfileId);
                return Ok(profile);
            }
            catch (ApiException ex)
            {
                return StatusCode(ex.StatusCode, new { message = ex.Message });
            }
        }

        [HttpPost("claim-watch-time")]
        public async Task<IActionResult> ClaimWatchTimeReward([FromBody] ClaimUserWatchTimeDto dto)
        {
            try
            {
                var profile = await engagementService.ClaimWatchTimeRewardAsync(dto.ProfileId, dto.SecondsWatched);
                return Ok(profile);
            }
            catch (ApiException ex)
            {
                return StatusCode(ex.StatusCode, new { message = ex.Message });
            }
        }
    }

    public class ClaimUserRewardDto
    {
        public Guid ProfileId { get; set; }
    }

    public class ClaimUserWatchTimeDto
    {
        public Guid ProfileId { get; set; }
        public int SecondsWatched { get; set; }
    }
}
