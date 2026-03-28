using ShareLibrary.cs.Data.Entities;
using System;
using System.Threading.Tasks;

namespace ServAd.ApiService.Services.UserEngagement.Interface
{
    public interface IUserEngagementService
    {
        Task<Profiles> ClaimDailyLoginRewardAsync(Guid profileId);
        Task<Profiles> ClaimWatchTimeRewardAsync(Guid profileId, decimal secondsWatched);
    }
}
