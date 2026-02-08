using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Chat.Interface
{
    public interface IChatService
    {
        Task<ChatMessage> SaveAndSendMessageAsync(ChatMessage message);
        Task<IEnumerable<ChatMessage>> GetChatHistoryAsync(Guid bookingId);
    }
}
