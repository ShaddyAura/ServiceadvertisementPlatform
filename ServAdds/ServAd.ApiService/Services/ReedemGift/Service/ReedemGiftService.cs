using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Notifications.Interface; // Added
using ServAd.ApiService.Services.RedeemGift.Interface;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.RedeemGift.Service
{
    public class RedeemGiftService(
        ServiceDbContext context,
        INotificationService notification, // Added Notification Service
        IRabbitmqService rabbitMQ,
        ILogger<RedeemGiftService> logger) : IRedeemGiftService
    {
        public async Task<RedeemedGift> ClaimGiftVoucherAsync(Guid profileId, Guid giftId)
        {
            // 1. Fetch Profile to check progress
            var profile = await context.Profiles.FindAsync(profileId)
                ?? throw new ApiException("Profile not found.", 404);

            var gift = await context.Gifts.FindAsync(giftId)
                ?? throw new ApiException("Gift item not found.", 404);

            // 2. Logic Check: Verify if Lifetime Points have hit the Target
            if (profile.LifetimePoints < gift.PointsRequired)
            {
                throw new ApiException($"Target not met. You need {gift.PointsRequired} lifetime points.", 400);
            }

            // 3. Generate the Voucher
            var redeemedGift = new RedeemedGift
            {
                Id = Guid.NewGuid(),
                ProfileId = profileId,
                GiftId = giftId,
                VoucherCode = $"SA-{gift.Title.Substring(0, 3).ToUpper()}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                RedeemedAt = DateTime.UtcNow,
                IsUsed = false
            };

            context.RedeemedGifts.Add(redeemedGift);
            await context.SaveChangesAsync();

            // --- Notification Added ---
            // This pushes the voucher code to the user's screen instantly via SignalR
            await notification.NotifyGiftRedeemed(profileId, gift.Title, redeemedGift.VoucherCode);

            // 4. Notify via RabbitMQ (For persistent storage or other background processes)
            await rabbitMQ.PublishMessageAsync(new
            {
                profileId,
                Title = gift.Title,
                Code = redeemedGift.VoucherCode,
                Action = "VoucherGenerated"
            }, "user_notification_queue");

            logger.LogInformation("Voucher {Code} created for Profile {Id}", redeemedGift.VoucherCode, profileId);

            return redeemedGift;
        }

        public async Task<IEnumerable<RedeemedGift>> GetMyVouchersAsync(Guid profileId)
        {
            return await context.RedeemedGifts
                .Include(r => r.Gift)
                .Where(r => r.ProfileId == profileId)
                .OrderByDescending(r => r.RedeemedAt)
                .ToListAsync();
        }

        public async Task<bool> MarkVoucherAsUsedAsync(Guid redeemedGiftId)
        {
            var voucher = await context.RedeemedGifts.FindAsync(redeemedGiftId)
                ?? throw new ApiException("Voucher not found.", 404);

            if (voucher.IsUsed)
                throw new ApiException("Voucher has already been used.", 400);

            voucher.IsUsed = true;
            await context.SaveChangesAsync();

            logger.LogInformation("Voucher {Id} marked as used.", redeemedGiftId);
            return true;
        }

        public async Task<RedeemedGift?> GetVoucherDetailsAsync(string voucherCode)
        {
            return await context.RedeemedGifts
                .Include(r => r.Gift)
                .FirstOrDefaultAsync(r => r.VoucherCode == voucherCode);
        }
    }
}