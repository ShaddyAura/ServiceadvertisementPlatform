using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.Chat.Dto;
using ServAd.ApiService.Services.Chat.Interface;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Controllers.Chat
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController(IChatService chatService) : ControllerBase
    {
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessageDto dto)
        {
            var model = new ChatMessage
            {
                BookingId = dto.BookingId,
                SenderProfileId = dto.SenderProfileId,
                MessageText = dto.MessageText
            };

            return Ok(await chatService.SaveAndSendMessageAsync(model));
        }

        [HttpGet("history/{bookingId:guid}")]
        public async Task<IActionResult> GetHistory(Guid bookingId)
            => Ok(await chatService.GetChatHistoryAsync(bookingId));
    }
}
