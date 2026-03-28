using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.Wallets.Dto;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Wallet.Interface;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Controllers.Wallets
{
    [Route("api/[controller]")]
    [ApiController]
    public class WalletsController(IUserWalletService walletService) : ControllerBase
    {
        /// <summary>
        /// Get wallet by profileId
        /// </summary>
        [HttpGet("getwallet")]
        [ProducesResponseType(typeof(UserWallet), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetWallet(Guid profileId)
        {
            try
            {
                var wallet = await walletService.GetWalletByProfileIdAsync(profileId);
                return Ok(wallet);
            }
            catch (ApiException ex)
            {
                return StatusCode(ex.StatusCode, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Purchase points
        /// </summary>
        [HttpPost("purchasepoints")]
        [ProducesResponseType(typeof(UserWallet), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PurchasePoints([FromBody] PurchasePointsDto dto)
        {
            try
            {
                if (dto.PointsToGive <= 0 || dto.Amount <= 0)
                    return BadRequest(new { message = "Amount and points must be greater than zero." });

                var wallet = await walletService.PurchasePointsAsync(
                    dto.ProfileId,
                    dto.Amount,
                    dto.PointsToGive,
                    dto.Gateway
                );

                return Ok(wallet);
            }
            catch (ApiException ex)
            {
                return StatusCode(ex.StatusCode, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Claim daily login reward if eligible (first 10 users daily)
        /// </summary>
        [HttpPost("claim-daily-reward")]
        public async Task<IActionResult> ClaimDailyReward([FromBody] ClaimRewardDto dto)
        {
            try
            {
                var wallet = await walletService.ClaimDailyLoginRewardAsync(dto.ProfileId);
                return Ok(wallet);
            }
            catch (ApiException ex)
            {
                return StatusCode(ex.StatusCode, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Claim watch time reward based on seconds watched
        /// </summary>
        [HttpPost("claim-watch-time")]
        public async Task<IActionResult> ClaimWatchTimeReward([FromBody] ClaimWatchTimeDto dto)
        {
            try
            {
                var wallet = await walletService.ClaimWatchTimeRewardAsync(dto.ProfileId, dto.SecondsWatched);
                return Ok(wallet);
            }
            catch (ApiException ex)
            {
                return StatusCode(ex.StatusCode, new { message = ex.Message });
            }
        }
    }

    public class ClaimRewardDto
    {
        public Guid ProfileId { get; set; }
    }

    public class ClaimWatchTimeDto
    {
        public Guid ProfileId { get; set; }
        public int SecondsWatched { get; set; }
    }
}
