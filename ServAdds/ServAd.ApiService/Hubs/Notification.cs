using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ShareLibrary.cs.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ServAd.ApiService.Hubs
{
    public class NotificationHub : Hub
    {
        private readonly ServiceDbContext _context;

        public NotificationHub(ServiceDbContext context)
        {
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            // 1. Get the UserId from the JWT token
            var userIdString = Context.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                            ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userIdString) && Guid.TryParse(userIdString, out var userId))
            {
                // 2. Look up the actual ProfileId from the database
                var profileId = await _context.Profiles
                    .Where(p => p.UserId == userId)
                    .Select(p => p.Id)
                    .FirstOrDefaultAsync();

                if (profileId != Guid.Empty)
                {
                    // 3. Add user to the ProfileId group (this matches what NotificationService sends to)
                    await Groups.AddToGroupAsync(Context.ConnectionId, profileId.ToString());
                }
            }

            await base.OnConnectedAsync();
        }

        // Allow the user to mark a specific notification as read from the UI
        public async Task MarkAsRead(Guid notificationId)
        {
            var userIdString = Context.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                            ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userIdString) && Guid.TryParse(userIdString, out var userId))
            {
                var profileId = await _context.Profiles
                    .Where(p => p.UserId == userId)
                    .Select(p => p.Id)
                    .FirstOrDefaultAsync();

                if (profileId != Guid.Empty)
                {
                    await Clients.Group(profileId.ToString()).SendAsync("NotificationRead", notificationId);
                }
            }
        }

        // Useful for the Chat feature: Notify the other person that the user is typing
        public async Task SendTypingIndicator(Guid receiverProfileId, Guid bookingId)
        {
            var senderId = Context.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                        ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            await Clients.Group(receiverProfileId.ToString())
                         .SendAsync("UserTyping", new { senderId, bookingId });
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Groups are automatically cleaned up by SignalR on disconnect
            await base.OnDisconnectedAsync(exception);
        }
    }
}