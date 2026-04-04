using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Notifications.Interface;
using ServAd.ApiService.Services.UserEngagement.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.UserEngagement.Service
{
    public class UserEngagementService(
        ServiceDbContext context,
        INotificationService notification,
        ILogger<UserEngagementService> logger) : IUserEngagementService
    {
        public async Task<Profiles> ClaimDailyLoginRewardAsync(Guid profileId)
        {
            var today = DateTime.UtcNow.Date;

            // 1) Verify the user hasn't already claimed today
            bool alreadyClaimed = await context.UserRewardHistories
                .AnyAsync(r => r.ProfileId == profileId && r.RewardType == "DailyLogin" && r.CreatedAt.Date == today);
            
            if (alreadyClaimed)
            {
                throw new ApiException("Reward already claimed for today.", 400);
            }

            // 2) Verify Global Limit (Only 10 users per day)
            int totalClaimsToday = await context.UserRewardHistories
                .CountAsync(r => r.RewardType == "DailyLogin" && r.CreatedAt.Date == today);

            if (totalClaimsToday >= 10)
            {
                throw new ApiException("Daily reward limit reached. Only 10 users can claim per day. Try again tomorrow!", 400);
            }

            // 3) Process Reward
            var profile = await context.Profiles.FindAsync(profileId) 
                ?? throw new ApiException("Profile not found.", 404);

            decimal pointsToGive = 2.0m;
            
            profile.BoostingPoints += pointsToGive;
            profile.LifetimePoints += pointsToGive;
            profile.UpdatedAt = DateTime.UtcNow;

            var rewardRecord = new UserRewardHistory
            {
                ProfileId = profileId,
                RewardType = "DailyLogin",
                PointsEarned = pointsToGive,
                CreatedAt = DateTime.UtcNow
            };
            
            context.UserRewardHistories.Add(rewardRecord);

            await context.SaveChangesAsync();

            // Notify UI about points update
            await notification.NotifyPointWalletUpdate(
                profileId, profile.BoostingPoints, pointsToGive, "Daily Login Reward"
            );

            logger.LogInformation("Profile {Id} claimed {Pts} daily login reward as a User.", 
                profileId, pointsToGive);

            return profile;
        }

        public async Task<Profiles> ClaimWatchTimeRewardAsync(Guid profileId, decimal secondsWatched)
        {
            if (secondsWatched < 10) throw new ApiException("Not enough watch time for a reward.", 400);

            var profile = await context.Profiles.FindAsync(profileId) 
                ?? throw new ApiException("Profile not found.", 404);
            
            // Give 10.0m points per watch session as specified
            decimal pointsToGive = 10.0m;
            
            profile.BoostingPoints += pointsToGive;
            profile.LifetimePoints += pointsToGive;
            profile.UpdatedAt = DateTime.UtcNow;

            var rewardRecord = new UserRewardHistory
            {
                ProfileId = profileId,
                RewardType = "WatchVideo",
                PointsEarned = pointsToGive,
                CreatedAt = DateTime.UtcNow
            };
            
            context.UserRewardHistories.Add(rewardRecord);

            await context.SaveChangesAsync();

            // Notify UI
            await notification.NotifyPointWalletUpdate(
                profileId, profile.BoostingPoints, pointsToGive, "Video Watch Reward"
            );

            return profile;
        }
    }
}
