using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Notifications.Interface; // Added
using ServAd.ApiService.Services.PointTransaction.Interface;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Services.PointTransaction.Service
{
    public class PointTransactionService(
        ServiceDbContext context,
        INotificationService notification, // Added Notification Service
        IRabbitmqService rabbitMQ,
        ILogger<PointTransactionService> logger) : IPointTransactionService
    {
        public async Task<PointsTransaction> RecordTransactionAsync(Guid walletId, int amount, PointsSource source)
        {
            var wallet = await context.Wallets.FindAsync(walletId)
                ?? throw new ApiException("Wallet not found.", 404);

            if (source == PointsSource.Purchase)
            {
                wallet.LifetimePurchasedPoints += amount;
            }

            wallet.PointsBalance += amount;
            wallet.LastUpdated = DateTime.UtcNow;

            var transaction = new PointsTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = walletId,
                Amount = amount,
                Source = source,
                TransactionDate = DateTime.UtcNow
            };

            context.PointsTransactions.Add(transaction);
            await context.SaveChangesAsync();

            // --- Notification Added ---
            // Alert user they earned points (e.g., Daily Strike, Purchase, etc.)
            await notification.NotifyPointsEarned(wallet.ProfileId, amount, source.ToString());

            return transaction;
        }

        public async Task<PointsTransaction> SpendPointsAsync(Guid walletId, int amount, PointsSource source)
        {
            var wallet = await context.Wallets.FindAsync(walletId)
                ?? throw new ApiException("Wallet not found.", 404);

            if (wallet.PointsBalance < amount)
            {
                throw new ApiException("Insufficient points balance for this action.", 400);
            }

            wallet.PointsBalance -= amount;
            wallet.LastUpdated = DateTime.UtcNow;

            var transaction = new PointsTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = walletId,
                Amount = amount,
                Source = source,
                TransactionDate = DateTime.UtcNow
            };

            context.PointsTransactions.Add(transaction);
            await context.SaveChangesAsync();

            // --- Notification Added ---
            // Update the UI balance via SignalR
            await notification.NotifyPointWalletUpdate(wallet.ProfileId, wallet.PointsBalance, 0, $"Spent for {source}");

            await rabbitMQ.PublishMessageAsync(new
            {
                walletId,
                Action = "PointsSpent",
                AmountSpent = amount,
                NewBalance = wallet.PointsBalance
            }, "points_update_queue");

            logger.LogInformation("Wallet {Id} spent {Amt} points for {Src}", walletId, amount, source);

            return transaction;
        }

        public async Task<IEnumerable<PointsTransaction>> GetWalletHistoryAsync(Guid walletId)
        {
            return await context.PointsTransactions
                .Where(t => t.WalletId == walletId)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task<bool> HasClaimedDailyStrikeTodayAsync(Guid walletId)
        {
            var today = DateTime.UtcNow.Date;
            return await context.PointsTransactions
                .AnyAsync(t => t.WalletId == walletId &&
                               t.Source == PointsSource.DailyStrike &&
                               t.TransactionDate.Date == today);
        }

        public async Task<int> GetTotalPurchasedPointsAsync(Guid walletId)
        {
            var wallet = await context.Wallets.FindAsync(walletId);
            return wallet?.LifetimePurchasedPoints ?? 0;
        }
    }
}