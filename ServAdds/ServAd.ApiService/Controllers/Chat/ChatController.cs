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
        /// <summary>
        /// Send chat message
        /// </summary>
        [HttpPost("sendmessage")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessageDto dto)
        {
            // Map the DTO to the updated ChatMessage model
            var model = new ChatMessage
            {
                BookingId = dto.BookingId,
                SenderProfileId = dto.SenderProfileId,   // Updated property name
                ReceiverProfileId = dto.ReceiverProfileId, // New property
                MessageText = dto.MessageText
            };

            var result = await chatService.SaveAndSendMessageAsync(model);
            return Ok(result);
        }

        /// <summary>
        /// Get chat history by bookingId
        /// </summary>
        [HttpGet("gethistory/{bookingId:guid}")]
        public async Task<IActionResult> GetHistory(Guid bookingId)
            => Ok(await chatService.GetChatHistoryAsync(bookingId));
    }
}