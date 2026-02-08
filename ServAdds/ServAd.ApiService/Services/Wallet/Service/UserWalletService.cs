using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ServAd.ApiService.Services.Wallet.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Wallet.Service
{

    public class UserWalletService(
        ServiceDbContext context,
        IRabbitmqService rabbitMQ,
        ILogger<UserWalletService> logger) : IUserWalletService
    {
        public async Task<UserWallet> GetWalletByProfileIdAsync(Guid profileId)
        {
            return await context.Wallets
                .FirstOrDefaultAsync(w => w.ProfileId == profileId)
                ?? throw new ApiException("Wallet not found.", 404);
        }

        public async Task<UserWallet> UpdateBalanceAsync(Guid profileId, decimal amount, string gateway, bool isCredit)
        {
            var wallet = await GetWalletByProfileIdAsync(profileId);

            // Update specific gateway balance
            switch (gateway.ToLower())
            {
                case "esewa":
                    wallet.eSewaBalance = isCredit ? wallet.eSewaBalance + amount : wallet.eSewaBalance - amount;
                    break;
                case "khalti":
                    wallet.KhaltiBalance = isCredit ? wallet.KhaltiBalance + amount : wallet.KhaltiBalance - amount;
                    break;
                default:
                    throw new ApiException("Invalid payment gateway.", 400);
            }

            if (wallet.eSewaBalance < 0 || wallet.KhaltiBalance < 0)
                throw new ApiException("Insufficient funds in selected gateway.", 400);

            wallet.LastUpdated = DateTime.UtcNow;
            await context.SaveChangesAsync();

            // 🚀 RabbitMQ: Notify about balance change
            await rabbitMQ.PublishMessageAsync(new
            {
                profileId,
                Amount = amount,
                Gateway = gateway,
                Type = isCredit ? "Credit" : "Debit"
            }, "wallet_update_queue");

            return wallet;
        }

        public async Task AddBoostingPointsAsync(Guid profileId, int points)
        {
            var wallet = await GetWalletByProfileIdAsync(profileId);
            wallet.PointsBalance += points;
            await context.SaveChangesAsync();
        }
    }
}