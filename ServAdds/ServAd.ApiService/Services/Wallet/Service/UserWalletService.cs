using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Notifications.Interface; // Added
using ServAd.ApiService.Services.RabbitMq.Interface;
using ServAd.ApiService.Services.Wallet.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Wallet.Service
{
    public class UserWalletService(
        ServiceDbContext context,
        INotificationService notification, // Added Notification Service
        IRabbitmqService rabbitMQ,
        ILogger<UserWalletService> logger) : IUserWalletService
    {
        public async Task<UserWallet> GetWalletByProfileIdAsync(Guid profileId)
        {
            return await context.Wallets
                .FirstOrDefaultAsync(w => w.ProfileId == profileId)
                ?? throw new ApiException("Wallet not found.", 404);
        }

        public async Task<UserWallet> PurchasePointsAsync(Guid profileId, decimal amount, int pointsToGive, string gateway)
        {
            try
            {
                var wallet = await GetWalletByProfileIdAsync(profileId);

                // 1. Update balances
                wallet.PointsBalance += pointsToGive;
                wallet.LifetimePurchasedPoints += pointsToGive;

                // 2. Gateway Revenue Tracking
                switch (gateway.ToLower())
                {
                    case "esewa":
                        wallet.eSewaBalance += amount;
                        break;
                    case "khalti":
                        wallet.KhaltiBalance += amount;
                        break;
                    default:
                        throw new ApiException("Invalid payment gateway provider.", 400);
                }

                wallet.LastUpdated = DateTime.UtcNow;
                await context.SaveChangesAsync();

                // --- Notification Added ---
                // This updates the user's UI balance and shows a "Payment Success" popup
                await notification.NotifyPointWalletUpdate(
                    profileId,
                    wallet.PointsBalance,
                    pointsToGive,
                    $"Purchase via {gateway.ToUpper()}"
                );

                // 3. RabbitMQ: Background logic for milestone checking (Gifts/Vouchers)
                await rabbitMQ.PublishMessageAsync(new
                {
                    ProfileId = profileId,
                    NewLifetimePoints = wallet.LifetimePurchasedPoints,
                    PointsPurchased = pointsToGive,
                    Action = "PointPurchaseSuccess"
                }, "wallet_purchase_queue");

                logger.LogInformation("Profile {Id} purchased {Pts} points via {Gateway}.",
                    profileId, pointsToGive, gateway);

                return wallet;
            }
            catch (ApiException) { throw; }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process point purchase for Profile {Id}", profileId);
                throw new ApiException("An error occurred while updating the wallet.", 500);
            }
        }
    }
}