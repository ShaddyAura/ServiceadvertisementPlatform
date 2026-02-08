using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Wallet.Interface
{
    public interface IUserWalletService
    {
        Task<UserWallet> GetWalletByProfileIdAsync(Guid profileId);
        Task<UserWallet> UpdateBalanceAsync(Guid profileId, decimal amount, string gateway, bool isCredit);
        Task AddBoostingPointsAsync(Guid profileId, int points);
    }
}
