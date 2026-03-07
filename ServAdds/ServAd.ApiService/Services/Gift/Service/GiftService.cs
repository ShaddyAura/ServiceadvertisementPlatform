using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Gift.Interface;
using ServAd.ApiService.Services.Notifications.Interface; // Added
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Gift.Service
{
    public class GiftService(
        ServiceDbContext context,
        INotificationService notification, // Added Notification Service
        IRabbitmqService rabbitMQ,
        ILogger<GiftService> logger) : IGiftService
    {
        public async Task<IEnumerable<ShareLibrary.cs.Data.Entities.Gift>> GetActiveGiftsAsync()
        {
            return await context.Gifts
                .Where(g => g.IsActive)
                .OrderBy(g => g.PointsRequired)
                .ToListAsync();
        }

        public async Task<RedeemedGift> RedeemVoucherAsync(Guid profileId, Guid giftId)
        {
            // 1. Fetch User Wallet to check progress
            var wallet = await context.Wallets
                .FirstOrDefaultAsync(w => w.ProfileId == profileId)
                ?? throw new ApiException("User wallet not found.", 404);

            // 2. Fetch the Gift details
            var gift = await context.Gifts.FindAsync(giftId)
                ?? throw new ApiException("Gift item not found.", 404);

            // 3. Logic Check: Verify if Lifetime Purchased Points have hit the Target
            if (wallet.LifetimePurchasedPoints < gift.PointsRequired)
            {
                throw new ApiException($"Ineligible. You need {gift.PointsRequired} lifetime purchased points.", 400);
            }

            // 4. Check if user already redeemed this specific gift
            var alreadyRedeemed = await context.RedeemedGifts
                .AnyAsync(r => r.ProfileId == profileId && r.GiftId == giftId && !r.IsUsed);

            if (alreadyRedeemed)
                throw new ApiException("You already have an active voucher for this gift.", 400);

            // 5. Generate the Voucher
            var redeemedGift = new RedeemedGift
            {
                Id = Guid.NewGuid(),
                ProfileId = profileId,
                GiftId = giftId,
                VoucherCode = $"SA-{gift.Title.Substring(0, Math.Min(5, gift.Title.Length)).ToUpper()}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}",
                RedeemedAt = DateTime.UtcNow,
                IsUsed = false
            };

            context.RedeemedGifts.Add(redeemedGift);
            await context.SaveChangesAsync();

            // --- Notification Added ---
            // This triggers the SignalR alert so the user sees their Voucher Code instantly.
            await notification.NotifyGiftRedeemed(profileId, gift.Title, redeemedGift.VoucherCode);

            // 🚀 RabbitMQ: Standard queue logic remains
            await rabbitMQ.PublishMessageAsync(new
            {
                ProfileId = profileId,
                GiftTitle = gift.Title,
                Code = redeemedGift.VoucherCode,
                Action = "VoucherRedeemed"
            }, "voucher_notification_queue");

            logger.LogInformation("Profile {Id} redeemed gift {GiftId}. Voucher: {Code}",
                profileId, giftId, redeemedGift.VoucherCode);

            return redeemedGift;
        }

        public async Task<IEnumerable<RedeemedGift>> GetUserVouchersAsync(Guid profileId)
        {
            return await context.RedeemedGifts
                .Include(r => r.Gift)
                .Where(r => r.ProfileId == profileId)
                .OrderByDescending(r => r.RedeemedAt)
                .ToListAsync();
        }
    }
}