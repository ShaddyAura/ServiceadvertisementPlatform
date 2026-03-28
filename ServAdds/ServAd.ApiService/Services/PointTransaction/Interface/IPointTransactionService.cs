using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Services.PointTransaction.Interface
{
    public interface IPointTransactionService
    {
        Task<PointsTransaction> RecordTransactionAsync(Guid walletId, decimal amount, PointsSource source);
        Task<IEnumerable<PointsTransaction>> GetWalletHistoryAsync(Guid walletId);
        Task<bool> HasClaimedDailyStrikeTodayAsync(Guid walletId);
        Task<decimal> GetTotalPurchasedPointsAsync(Guid walletId);

        // Added: Handles spending points (e.g., for Boosting)
        Task<PointsTransaction> SpendPointsAsync(Guid walletId, decimal amount, PointsSource source);
    }
}