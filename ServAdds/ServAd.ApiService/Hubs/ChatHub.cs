using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace ServAd.ApiService.Hubs
{
    public class ChatHub : Hub
    {
        // Users join a "Room" based on their BookingId to keep chats private
        public async Task JoinBookingChat(string bookingId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, bookingId);
        }

        public async Task LeaveBookingChat(string bookingId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, bookingId);
        }
    }
}
