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
        public async Task<ActionResult<BoostingTransaction>> ApplyBoost(
            [FromBody] BoostRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var transaction = await boostingService.BoostServiceAsync(
                dto.ServiceId,
                dto.BoostLevel,
                dto.PointsToSpend,
                dto.Days
            );

            return Ok(transaction);
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<BoostingTransaction>>>
            GetHistory(Guid serviceId)
        {
            var history = await boostingService
                .GetServiceBoostHistoryAsync(serviceId);

            return Ok(history);
        }

        // ✅ FIXED STATUS ENDPOINT
        [HttpGet("status/{serviceId:guid}")]
        public async Task<ActionResult<BoostingTransaction?>> GetStatus(Guid serviceId)
        {
            var boostInfo = await boostingService
                .GetServiceBoostInfoAsync(serviceId);

            if (boostInfo == null)
                return Ok(null);

            return Ok(boostInfo);
        }

        [HttpPost("cancel/{serviceId:guid}")]
        public async Task<IActionResult> CancelBoost(Guid serviceId)
        {
            await boostingService.CancelBoostAsync(serviceId);
            return Ok("Boost cancelled successfully.");
        }
    }
    
}