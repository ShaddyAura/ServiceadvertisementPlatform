using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Controllers.PointTransection.Dto
{
    // Request for spending points on boosting
    public record SpendPointsRequest(Guid WalletId, int Amount);

    // Response for the transaction ledger
    public record TransactionHistoryResponse(
        Guid Id,
        int Amount,
        PointsSource Source,
        DateTime TransactionDate);

    // Status of the user's daily rewards and gift progress
    public record PointStatusResponse(
        bool DailyStrikeClaimedToday,
        int CurrentPointsBalance,
        int LifetimePurchasedPoints);
}