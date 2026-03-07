    using ShareLibrary.cs.Data.Entities;

    namespace ServAd.ApiService.Services.Wallet.Interface
    {
        public interface IUserWalletService
        {
            Task<UserWallet> GetWalletByProfileIdAsync(Guid profileId);

            // Specifically for buying points: Increments both current balance and lifetime target
            Task<UserWallet> PurchasePointsAsync(Guid profileId, decimal amount, int pointsToGive, string gateway);
        }
    }

