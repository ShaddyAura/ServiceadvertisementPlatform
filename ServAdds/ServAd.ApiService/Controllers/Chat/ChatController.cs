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

            try
            {
                var result = await chatService.SaveAndSendMessageAsync(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get chat history by bookingId
        /// </summary>
        [HttpGet("gethistory/{bookingId:guid}/{profileId:guid}")]
        public async Task<IActionResult> GetHistory(Guid bookingId, Guid profileId)
            => Ok(await chatService.GetChatHistoryAsync(bookingId, profileId));

        /// <summary>
        /// Delete chat history by bookingId
        /// </summary>
        [HttpDelete("deletehistory/{bookingId:guid}/{profileId:guid}")]
        public async Task<IActionResult> DeleteHistory(Guid bookingId, Guid profileId)
        {
            try
            {
                var success = await chatService.DeleteChatHistoryAsync(bookingId, profileId);
                return Ok(new { message = success ? "Chat deleted successfully." : "No chat messages found to delete." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Delete failed: {ex.Message}" });
            }
        }
    }
}