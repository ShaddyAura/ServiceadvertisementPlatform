using Microsoft.AspNetCore.SignalR;
using ShareLibrary.cs.Data.Entities; // Ensure this points to your ChatMessage model

namespace ServAd.ApiService.Hubs
{
    public partial class ChatHub : Hub
    {
        public async Task JoinBookingGroup(string bookingId)
        {
            if (string.IsNullOrEmpty(bookingId)) return;
            await Groups.AddToGroupAsync(Context.ConnectionId, bookingId);
        }

        // ✅ Using ChatMessage model directly
        public async Task SendMessageToGroup(ChatMessage message)
        {
            if (message == null || message.BookingId == Guid.Empty)
            {
                throw new HubException("BookingId is required to send a message.");
            }

            // Broadcast the full model. 
            // The frontend will receive 'senderProfileId' and 'receiverProfileId'
            await Clients
                .Group(message.BookingId.ToString())
                .SendAsync("ReceiveMessage", new
                {
                    id = message.Id == Guid.Empty ? Guid.NewGuid() : message.Id,
                    bookingId = message.BookingId,
                    senderProfileId = message.SenderProfileId,
                    receiverProfileId = message.ReceiverProfileId,
                    messageText = message.MessageText,
                    sentAt = message.SentAt == default ? DateTime.UtcNow : message.SentAt
                });
        }

        public async Task LeaveBookingChat(string bookingId)
        {
            if (string.IsNullOrEmpty(bookingId)) return;
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, bookingId);
        }
    }
}