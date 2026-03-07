using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.Gifts.Dto;
using ServAd.ApiService.Services.Gift.Interface;

namespace ServAd.ApiService.Controllers.Gifts
{
    [Route("api/[controller]")]
    [ApiController]
    public class GiftsController(IGiftService giftService) : ControllerBase
    {
        [HttpGet("Gift")]
        public async Task<IActionResult> GetGifts()
        {
            var gifts = await giftService.GetActiveGiftsAsync();
            var response = gifts.Select(g => new GiftResponseDto(
                g.Id, g.Title, g.Description, g.PointsRequired, g.ImageUrl));
            return Ok(response);
        }
    }
}