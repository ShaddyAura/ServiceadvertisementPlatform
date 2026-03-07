using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Hubs;
using ServAd.ApiService.Services.Chat.Interface;
using ServAd.ApiService.Services.Notifications.Interface; // Added
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Chat.Service
{
    public class ChatService(
        ServiceDbContext context,
        IHubContext<ChatHub> hubContext,
        INotificationService notification, // Added Notification Service
        IRabbitmqService rabbitMQ) : IChatService
    {
        public async Task<ChatMessage> SaveAndSendMessageAsync(ChatMessage message)
        {
            // 1. Prepare Message Metadata
            message.Id = Guid.NewGuid();
            message.SentAt = DateTime.UtcNow;

            // 2. Save to Database
            context.ChatMessages.Add(message);
            await context.SaveChangesAsync();

            // 3. Trigger Global Notification (For the "Notification Bell" / Push)
            // This alerts the receiver even if they aren't in the specific Chat Hub group right now.
            await notification.NotifyNewChat(
                message.ReceiverProfileId,
                message.SenderProfileId,
                message.BookingId,
                message.MessageText
            );

            // 4. Broadcast to the SignalR Group (For the active chat window)
            await hubContext.Clients.Group(message.BookingId.ToString())
                .SendAsync("ReceiveMessage", new
                {
                    id = message.Id,
                    bookingId = message.BookingId,
                    senderProfileId = message.SenderProfileId,
                    receiverProfileId = message.ReceiverProfileId,
                    messageText = message.MessageText,
                    sentAt = message.SentAt
                });

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