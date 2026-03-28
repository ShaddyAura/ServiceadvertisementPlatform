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
        INotificationService notification) : IChatService
    {
        public async Task<ChatMessage> SaveAndSendMessageAsync(ChatMessage message)
        {
            // 1. Prepare Message Metadata
            message.Id = Guid.NewGuid();
            message.SentAt = DateTime.UtcNow;

            // 2. Validate that both Sender and Receiver profiles exist
            var senderExists = await context.Profiles.AnyAsync(p => p.Id == message.SenderProfileId);
            if (!senderExists)
                throw new Exception($"Sender profile '{message.SenderProfileId}' does not exist.");

            var receiverExists = await context.Profiles.AnyAsync(p => p.Id == message.ReceiverProfileId);
            if (!receiverExists)
                throw new Exception($"Receiver profile '{message.ReceiverProfileId}' does not exist.");

            // 3. Save to Database
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

        public async Task<IEnumerable<ChatMessage>> GetChatHistoryAsync(Guid bookingId, Guid profileId)
        {
            var messages = await context.ChatMessages
                .Where(m => m.BookingId == bookingId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return messages.Where(m => 
                !(m.SenderProfileId == profileId && m.IsDeletedBySender) &&
                !(m.ReceiverProfileId == profileId && m.IsDeletedByReceiver)
            );
        }

        public async Task<bool> DeleteChatHistoryAsync(Guid bookingId, Guid profileId)
        {
            var messages = await context.ChatMessages.Where(m => m.BookingId == bookingId).ToListAsync();
            
            if (messages.Count == 0)
                return false;

            // Phase 1: Mark as deleted for this user
            foreach (var m in messages)
            {
                if (m.SenderProfileId == profileId)
                    m.IsDeletedBySender = true;

                if (m.ReceiverProfileId == profileId)
                    m.IsDeletedByReceiver = true;
            }

            // Phase 2: Remove messages deleted by both parties
            var toRemove = messages.Where(m => m.IsDeletedBySender && m.IsDeletedByReceiver).ToList();
            if (toRemove.Count > 0)
                context.ChatMessages.RemoveRange(toRemove);

            await context.SaveChangesAsync();
            return true;
        }
    }
}