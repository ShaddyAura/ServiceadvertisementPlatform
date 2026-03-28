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
        private static DateTime _currentDate = DateTime.UtcNow.Date;
        private static readonly HashSet<Guid> _claimedUsers = [];
        private static readonly System.Threading.Lock _lockObj = new();

        public async Task<Profiles> ClaimDailyLoginRewardAsync(Guid profileId)
        {
            lock (_lockObj)
            {
                if (DateTime.UtcNow.Date > _currentDate)
                {
                    _currentDate = DateTime.UtcNow.Date;
                    _claimedUsers.Clear();
                }

                if (_claimedUsers.Contains(profileId))
                {
                    throw new ApiException("Reward already claimed for today.", 400);
                }

                _claimedUsers.Add(profileId);
            }

            var profile = await context.Profiles.FindAsync(profileId) 
                ?? throw new ApiException("Profile not found.", 404);

            decimal pointsToGive = 2.0m;
            
            profile.BoostingPoints += pointsToGive;
            profile.LifetimePoints += pointsToGive;
            profile.UpdatedAt = DateTime.UtcNow;

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

            await context.SaveChangesAsync();

            // Notify UI
            await notification.NotifyPointWalletUpdate(
                profileId, profile.BoostingPoints, pointsToGive, "Video Watch Reward"
            );

            return profile;
        }
    }
}
