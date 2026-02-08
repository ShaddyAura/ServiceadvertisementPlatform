using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.Boosting.Dto;
using ServAd.ApiService.Services.Boosting.Interface;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Controllers.Boosting
{

    [ApiController]
    [Route("api/[controller]")]
    public class BoostingController(IBoostingService boostingService) : ControllerBase
    {
        [HttpPost("apply")]
        public async Task<ActionResult<BoostingTransaction>> ApplyBoost([FromBody] BoostRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Call the service with direct parameters
            var transaction = await boostingService.BoostServiceAsync(
                dto.ServiceId,
                dto.PointsToSpend,
                dto.Days
            );

            return Ok(transaction);
        }

        [HttpGet("history/{serviceId:guid}")]
        public async Task<ActionResult<IEnumerable<BoostingTransaction>>> GetHistory(Guid serviceId)
        {
            var history = await boostingService.GetServiceBoostHistoryAsync(serviceId);
            return Ok(history);
        }

        [HttpGet("status/{serviceId:guid}")]
        public async Task<ActionResult<bool>> GetStatus(Guid serviceId)
        {
            var isBoosted = await boostingService.IsServiceCurrentlyBoostedAsync(serviceId);
            return Ok(new { IsBoosted = isBoosted });
        }
    }
}