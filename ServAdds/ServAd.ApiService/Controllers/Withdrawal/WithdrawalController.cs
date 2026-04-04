using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.Withdrawal.Dto;
using ServAd.ApiService.Services.Withdrawal.Interface;

namespace ServAd.ApiService.Controllers.Withdrawal
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WithdrawalController(IWithdrawalService withdrawalService) : ControllerBase
    {
        [HttpPost("request")]
        public async Task<IActionResult> RequestWithdrawal([FromBody] CreateWithdrawalDto dto)
        {
            var request = await withdrawalService.CreateRequestAsync(dto.ProfileId, dto.Amount, dto.PaymentMethod, dto.AccountDetails);
            return Ok(new { Message = "Withdrawal request submitted.", RequestId = request.Id });
        }

        [HttpGet("all-requests")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await withdrawalService.GetAllRequestsAsync();
            return Ok(requests);
        }

        [HttpGet("user-requests/{profileId}")]
        public async Task<IActionResult> GetUserRequests(Guid profileId)
        {
            var requests = await withdrawalService.GetRequestsByProfileIdAsync(profileId);
            return Ok(requests);
        }

        [HttpPatch("approve/{requestId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveRequest(Guid requestId)
        {
            var success = await withdrawalService.ApproveRequestAsync(requestId);
            if (!success) return BadRequest("Could not approve request.");
            return Ok(new { Message = "Withdrawal approved and funds deducted." });
        }

        [HttpPatch("reject/{requestId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectRequest(Guid requestId)
        {
            var success = await withdrawalService.RejectRequestAsync(requestId);
            if (!success) return BadRequest("Could not reject request.");
            return Ok(new { Message = "Withdrawal request rejected." });
        }
    }
}
