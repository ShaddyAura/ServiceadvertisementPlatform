using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Hubs;
using ServAd.ApiService.Services.Chat.Interface;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Chat.Service
{

    public class ChatService(
        ServiceDbContext context,
        IHubContext<ChatHub> hubContext,
        IRabbitmqService rabbitMQ) : IChatService
    {
        public async Task<ChatMessage> SaveAndSendMessageAsync(ChatMessage message)
        {
            message.Id = Guid.NewGuid();
            message.SentAt = DateTime.UtcNow;

            // 1. Persist to Database
            context.ChatMessages.Add(message);
            await context.SaveChangesAsync();

            // 2. Real-time Push via SignalR
            await hubContext.Clients.Group(message.BookingId.ToString())
                .SendAsync("ReceiveMessage", new
                {
                    message.SenderProfileId,
                    message.MessageText,
                    message.SentAt
                });

            // 3. Notify RabbitMQ (Useful for Push Notifications if user is offline)
            await rabbitMQ.PublishMessageAsync(new
            {
                message.BookingId,
                message.MessageText,
                message.SenderProfileId
            }, "chat_notifications_queue");

            return message;
        }

        public async Task<IEnumerable<ChatMessage>> GetChatHistoryAsync(Guid bookingId)
        {
            return await context.ChatMessages
                .Where(m => m.BookingId == bookingId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }
    }
}