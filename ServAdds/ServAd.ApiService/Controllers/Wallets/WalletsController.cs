using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.Wallets.Dto;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Wallet.Interface;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Controllers.Wallets
{
    [Route("[controller]")]
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
    }
}
