using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.ReedemGifts.Dto;
using ServAd.ApiService.Services.RedeemGift.Interface;

namespace ServAd.ApiService.Controllers.ReedemGifts
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReedemGiftsController(IRedeemGiftService redeemService) : ControllerBase
    {
        [HttpPost("claim")]
        public async Task<IActionResult> ClaimVoucher([FromBody] ReedemRequestDto request)
        {
            var voucher = await redeemService.ClaimGiftVoucherAsync(request.ProfileId, request.GiftId);
            return Ok(voucher);
        }

        [HttpGet("myvouchers")]
        public async Task<IActionResult> GetMyVouchers(Guid profileId)
        {
            var vouchers = await redeemService.GetMyVouchersAsync(profileId);
            var response = vouchers.Select(v => new VoucherResponseDto(
                v.Gift.Title, v.VoucherCode, v.RedeemedAt, v.IsUsed));
            return Ok(response);
        }
    }
}