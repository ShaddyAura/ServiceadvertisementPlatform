using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ServAd.ApiService.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var profileId = Context.User?.FindFirst("ProfileId")?.Value
                         ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(profileId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, profileId);
            }

            await base.OnConnectedAsync();
        }

        // Allow the user to mark a specific notification as read from the UI
        public async Task MarkAsRead(Guid notificationId)
        {
            var profileId = Context.User?.FindFirst("ProfileId")?.Value;

            // We broadcast back to the user's other devices that this is now read
            if (!string.IsNullOrEmpty(profileId))
            {
                await Clients.Group(profileId).SendAsync("NotificationRead", notificationId);
            }
        }

        // Useful for the Chat feature: Notify the other person that the user is typing
        public async Task SendTypingIndicator(Guid receiverProfileId, Guid bookingId)
        {
            var senderId = Context.User?.FindFirst("ProfileId")?.Value;
            await Clients.Group(receiverProfileId.ToString())
                         .SendAsync("UserTyping", new { senderId, bookingId });
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var profileId = Context.User?.FindFirst("ProfileId")?.Value;
            if (!string.IsNullOrEmpty(profileId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, profileId);
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}