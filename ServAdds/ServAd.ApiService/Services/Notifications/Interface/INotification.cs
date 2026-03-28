using System.Threading.Tasks;

namespace ServAd.ApiService.Services.Notifications.Interface
{
    public interface INotificationService
    {
        // Booking Notifications (Matches Bookings Entity)
        Task NotifyBookingUpdate(Guid bookingId, Guid customerId, Guid providerId, string status, decimal price);

        // Chat Notifications (Matches ChatMessage Entity)
        Task NotifyNewChat(Guid receiverId, Guid senderId, Guid bookingId, string messageText);

        // Wallet & Payment (Matches UserWallet Entity)
        Task NotifyWalletUpdate(Guid profileId, decimal amount, string gateway, string transactionId);
        Task NotifyPointWalletUpdate(Guid profileId, decimal pointsBalance, decimal cashBalance, string updateType);

        // Points & Rewards (Matches RedeemedGift & Gift Entities)
        Task NotifyPointsEarned(Guid profileId, decimal pointsAdded, string reason);
        Task NotifyGiftRedeemed(Guid profileId, string giftTitle, string voucherCode);

        // Boosting (Matches BoostingTransaction & ServiceListings Entities)
        Task NotifyBoostingActivated(Guid serviceId, Guid profileId, DateTime expiry, decimal pointsSpent);

        // Service Management
        Task NotifyServiceAdded(Guid profileId, string serviceName);
    }
}