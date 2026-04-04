    using ShareLibrary.cs.Data.Entities;

    namespace ServAd.ApiService.Services.Wallet.Interface
    {
        public interface IUserWalletService
        {
            Task<UserWallet> GetWalletByProfileIdAsync(Guid profileId);
            Task<IEnumerable<UserWallet>> GetAllWalletsAsync();

            // Specifically for buying points: Increments both current balance and lifetime target
            Task<UserWallet> PurchasePointsAsync(Guid profileId, decimal amount, decimal pointsToGive, string gateway);

            // Reward systems
            Task<UserWallet> ClaimDailyLoginRewardAsync(Guid profileId);
            Task<UserWallet> ClaimWatchTimeRewardAsync(Guid profileId, decimal secondsWatched);
        }
    }

