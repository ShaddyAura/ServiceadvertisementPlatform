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
        public async Task<IEnumerable<UserWallet>> GetAllWalletsAsync()
        {
            return await context.Wallets.ToListAsync();
        }

        public async Task<UserWallet> GetWalletByProfileIdAsync(Guid profileOrUserId)
        {
            // Auto-resolve whether the provided Guid is a ProfileId directly or a UserId fallback from JWT
            var profile = await context.Profiles.FirstOrDefaultAsync(p => p.Id == profileOrUserId || p.UserId == profileOrUserId) 
                            ?? throw new ApiException("Associated Profile could not be found for the given token identity.", 400);

            var actualProfileId = profile.Id;

            var wallet = await context.Wallets.FirstOrDefaultAsync(w => w.ProfileId == actualProfileId);
            if (wallet == null)
            {
                wallet = new UserWallet
                {
                    Id = Guid.NewGuid(),
                    ProfileId = actualProfileId,
                    PointsBalance = 0,
                    LifetimePurchasedPoints = 0,
                    ESewaBalance = 0,
                    KhaltiBalance = 0,
                    LastUpdated = DateTime.UtcNow
                };
                context.Wallets.Add(wallet);
                await context.SaveChangesAsync();
            }
            return wallet;
        }

        public async Task<UserWallet> PurchasePointsAsync(Guid profileId, decimal amount, decimal pointsToGive, string gateway)
        {
            try
            {
                var wallet = await GetWalletByProfileIdAsync(profileId);

                // 1. Update balances
                wallet.PointsBalance += pointsToGive;
                wallet.LifetimePurchasedPoints += pointsToGive;

                // 2. Gateway Revenue Tracking
                if (string.Equals(gateway, "esewa", StringComparison.OrdinalIgnoreCase))
                {
                    wallet.ESewaBalance += amount;
                }
                else if (string.Equals(gateway, "khalti", StringComparison.OrdinalIgnoreCase))
                {
                    wallet.KhaltiBalance += amount;
                }
                else
                {
                    throw new ApiException("Invalid payment gateway provider.", 400);
                }

                wallet.LastUpdated = DateTime.UtcNow;

                var transaction = new PointsTransaction
                {
                    Id = Guid.NewGuid(),
                    WalletId = wallet.Id,
                    Amount = pointsToGive,
                    Source = ShareLibrary.cs.Data.Enums.PointsSource.Purchase,
                    TransactionDate = DateTime.UtcNow
                };
                context.PointsTransactions.Add(transaction);

                await context.SaveChangesAsync();

                try 
                {
                    // --- Notification Added ---
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
                }
                catch (Exception pubEx)
                {
                    logger.LogWarning(pubEx, "Failed to publish RabbitMQ or Notification for Profile {Id}. Continuing payment process.", profileId);
                }

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

        private static DateTime _currentDate = DateTime.UtcNow.Date;
        private static readonly HashSet<Guid> _claimedProviders = [];
        private static readonly System.Threading.Lock _lockObj = new();

        public async Task<UserWallet> ClaimDailyLoginRewardAsync(Guid profileId)
        {
            lock (_lockObj)
            {
                if (DateTime.UtcNow.Date > _currentDate)
                {
                    _currentDate = DateTime.UtcNow.Date;
                    _claimedProviders.Clear();
                }

                if (_claimedProviders.Count >= 10 || _claimedProviders.Contains(profileId))
                {
                    throw new ApiException("Daily limit reached or reward already claimed.", 400);
                }

                _claimedProviders.Add(profileId);
            }

            var wallet = await GetWalletByProfileIdAsync(profileId);
            decimal pointsToGive = 2.0m;
            
            wallet.PointsBalance += pointsToGive;
            wallet.LifetimePurchasedPoints += pointsToGive;
            wallet.LastUpdated = DateTime.UtcNow;

            var transaction = new PointsTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = wallet.Id,
                Amount = pointsToGive,
                Source = ShareLibrary.cs.Data.Enums.PointsSource.DailyStrike,
                TransactionDate = DateTime.UtcNow
            };
            context.PointsTransactions.Add(transaction);

            await context.SaveChangesAsync();

            await notification.NotifyPointWalletUpdate(
                profileId, wallet.PointsBalance, pointsToGive, "Daily Login Reward"
            );

            return wallet;
        }

        public async Task<UserWallet> ClaimWatchTimeRewardAsync(Guid profileId, decimal secondsWatched)
        {
            if (secondsWatched < 60) throw new ApiException("Not enough watch time for a reward.", 400);

            var wallet = await GetWalletByProfileIdAsync(profileId);
            
            // Give 0.1m points per watch session as specified
            decimal pointsToGive = 0.1m;
            
            wallet.PointsBalance += pointsToGive;
            wallet.LifetimePurchasedPoints += pointsToGive;
            wallet.LastUpdated = DateTime.UtcNow;

            var transaction = new PointsTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = wallet.Id,
                Amount = pointsToGive,
                Source = ShareLibrary.cs.Data.Enums.PointsSource.AdWatch,
                TransactionDate = DateTime.UtcNow
            };
            context.PointsTransactions.Add(transaction);

            await context.SaveChangesAsync();

            return wallet;
        }

        public async Task<UserWallet> AddBookingRevenueAsync(Guid profileId, decimal amount, string gateway)
        {
            var wallet = await GetWalletByProfileIdAsync(profileId);

            if (string.Equals(gateway, "esewa", StringComparison.OrdinalIgnoreCase))
            {
                wallet.ESewaBalance += amount;
            }
            else if (string.Equals(gateway, "khalti", StringComparison.OrdinalIgnoreCase))
            {
                wallet.KhaltiBalance += amount;
            }

            wallet.LastUpdated = DateTime.UtcNow;
            await context.SaveChangesAsync();
            return wallet;
        }
    }
}