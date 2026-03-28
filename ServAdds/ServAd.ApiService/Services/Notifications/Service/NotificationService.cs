using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ServAd.ApiService.Hubs;
using ServAd.ApiService.Services.Notifications.Interface;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using static ShareLibrary.cs.Data.Entities.Messages;

namespace ServAd.ApiService.Services.Notifications.Service
{
    public class NotificationService(
        IRabbitmqService rabbitMQ,
        ServiceDbContext context,
        ILogger<NotificationService> logger,
        IHubContext<NotificationHub> hubContext
    ) : INotificationService
    {
        /// <summary>
        /// Centralized helper to handle the three-way notification flow:
        /// 1. Persistent Storage (SQL)
        /// 2. Real-time Push (SignalR)
        /// 3. Message Queue (RabbitMQ)
        /// </summary>
        private async Task SaveAndNotify(Notification notif, object rabbitMessage, string queueName)
        {
            // Check if the Profile actually exists before inserting
            var profileExists = await context.Profiles.AnyAsync(p => p.Id == notif.ProfileId);

            if (profileExists)
            {
                context.Notifications.Add(notif);
                await context.SaveChangesAsync();
                logger.LogInformation("Notification saved to SQL for Profile {Id}", notif.ProfileId);
            }
            else
            {
                // Log this so you know why the table is empty!
                logger.LogWarning("Notification NOT saved. ProfileId {Id} does not exist in the Profiles table.", notif.ProfileId);
            }

            // Always try to send SignalR and RabbitMQ
            await hubContext.Clients.Group(notif.ProfileId.ToString()).SendAsync("ReceiveNotification", notif);
            await rabbitMQ.PublishMessageAsync(rabbitMessage, queueName);
        }

        public async Task NotifyBookingUpdate(Guid bookingId, Guid customerId, Guid providerId, string status, decimal price)
        {
            var targetId = status.Equals("Pending", StringComparison.OrdinalIgnoreCase) ? providerId : customerId;

            // --- SAFETY CHECK ---
            var profileExists = await context.Profiles.AnyAsync(p => p.Id == targetId);
            if (!profileExists)
            {
                // If the profile doesn't exist, we can't save the notification.
                // Log it and return so the app doesn't crash.
                logger.LogWarning("Notification failed: Profile {TargetId} not found in database.", targetId);
                return;
            }

            var notif = new Notification
            {
                Id = Guid.NewGuid(),
                ProfileId = targetId,
                CustomerId = customerId,
                ProviderId = providerId,
                Title = "Booking Update",
                Message = $"Booking is {status}. Price: {price}",
                ActionUrl = $"/bookings/{bookingId}",
                CreatedAt = DateTime.Now
            };

            await SaveAndNotify(notif, new { bookingId, status }, "booking_notifications");
        }

        public async Task NotifyNewChat(Guid receiverId, Guid senderId, Guid bookingId, string messageText)
        {
            var preview = messageText.Length > 50 ? messageText[..50] + "..." : messageText;

            var notif = new Notification
            {
                ProfileId = receiverId,
                CustomerId = senderId, // The person who sent the message
                ProviderId = receiverId, // The person receiving it
                Title = "New Message",
                Message = preview,
                ActionUrl = $"/chats/{bookingId}",
                CreatedAt = DateTime.Now
            };

            var rabbitMessage = new ChatNotification(Guid.NewGuid(), bookingId, senderId, receiverId, preview);
            await SaveAndNotify(notif, rabbitMessage, "chat_notifications");
        }

        public async Task NotifyWalletUpdate(Guid profileId, decimal amount, string gateway, string transactionId)
        {
            var notif = new Notification
            {
                ProfileId = profileId,
                CustomerId = profileId,
                Title = "Payment Successful",
                Message = $"NPR {amount} added via {gateway}. Transaction ID: {transactionId}",
                CreatedAt = DateTime.Now
            };

            var rabbitMessage = new WalletNotification(profileId, 0, amount, $"Payment via {gateway}");
            await SaveAndNotify(notif, rabbitMessage, "payment_notifications");
        }

        public async Task NotifyPointWalletUpdate(Guid profileId, decimal pointsBalance, decimal cashBalance, string updateType)
        {
            var notif = new Notification
            {
                ProfileId = profileId,
                CustomerId = profileId,
                Title = "Wallet Balance Updated",
                Message = $"Transaction type: {updateType}. New Balance: {pointsBalance} points / NPR {cashBalance}",
                CreatedAt = DateTime.Now
            };

            var rabbitMessage = new WalletNotification(profileId, pointsBalance, cashBalance, updateType);
            await SaveAndNotify(notif, rabbitMessage, "wallet_notifications");
        }

        public async Task NotifyPointsEarned(Guid profileId, decimal pointsAdded, string reason)
        {
            var notif = new Notification
            {
                ProfileId = profileId,
                CustomerId = profileId,
                Title = "Points Earned!",
                Message = $"You've received {pointsAdded} points for: {reason}",
                CreatedAt = DateTime.Now
            };

            var rabbitMessage = new WalletNotification(profileId, pointsAdded, 0, reason);
            await SaveAndNotify(notif, rabbitMessage, "points_notifications");
        }

        public async Task NotifyGiftRedeemed(Guid profileId, string giftTitle, string voucherCode)
        {
            var notif = new Notification
            {
                ProfileId = profileId,
                CustomerId = profileId,
                Title = "Reward Redeemed",
                Message = $"Gift: {giftTitle}. Your code is: {voucherCode}",
                CreatedAt = DateTime.Now
            };

            var rabbitMessage = new GiftNotification(Guid.NewGuid(), profileId, giftTitle, voucherCode);
            await SaveAndNotify(notif, rabbitMessage, "reward_notifications");
        }

        public async Task NotifyBoostingActivated(Guid serviceId, Guid profileId, DateTime expiry, decimal pointsSpent)
        {
            var notif = new Notification
            {
                ProfileId = profileId,
                ProviderId = profileId,
                Title = "Service Boost Active",
                Message = $"Your service is now boosted until {expiry:g}. Points used: {pointsSpent}",
                ActionUrl = $"/services/{serviceId}",
                CreatedAt = DateTime.Now
            };

            var rabbitMessage = new BoostNotification(serviceId, "Service Boosted", pointsSpent, expiry);
            await SaveAndNotify(notif, rabbitMessage, "marketing_notifications");
        }

        public async Task NotifyServiceAdded(Guid profileId, string serviceName)
        {
            var notif = new Notification
            {
                ProfileId = profileId,
                ProviderId = profileId,
                Title = "Listing Approved",
                Message = $"Your service '{serviceName}' is now live on the platform!",
                CreatedAt = DateTime.Now
            };

            var rabbitMessage = new { ProfileId = profileId, Title = "Service Added", Content = $"{serviceName} is now live!" };
            await SaveAndNotify(notif, rabbitMessage, "service_notifications");
        }
    }
}