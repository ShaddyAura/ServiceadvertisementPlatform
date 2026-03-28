using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Controllers.PointTransection.Dto
{
    // Request for spending points on boosting
    public record SpendPointsRequest(Guid WalletId, decimal Amount);

    // Response for the transaction ledger
    public record TransactionHistoryResponse(
        Guid Id,
        decimal Amount,
        PointsSource Source,
        DateTime TransactionDate);

    // Status of the user's daily rewards and gift progress
    public record PointStatusResponse(
        bool DailyStrikeClaimedToday,
        decimal CurrentPointsBalance,
        decimal LifetimePurchasedPoints);
}