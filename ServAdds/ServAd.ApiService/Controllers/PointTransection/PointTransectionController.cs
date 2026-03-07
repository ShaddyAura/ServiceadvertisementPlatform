using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.PointTransection.Dto;
using ServAd.ApiService.Services.PointTransaction.Interface;
using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Controllers.PointTransection
{
    [Route("api/[controller]")]
    [ApiController]
    public class PointTransectionController(
        IPointTransactionService transactionService,
        ILogger<PointTransectionController> logger) : ControllerBase
    {
        /// <summary>
        /// Gets the user's point history (Ledger).
        /// </summary>
        [HttpGet("historypoints")]
        public async Task<IActionResult> GetHistory(Guid walletId)
        {
            var history = await transactionService.GetWalletHistoryAsync(walletId);

            var response = history.Select(h => new TransactionHistoryDto
            {
                TransactionId = h.Id,
                Amount = h.Amount,
                Source = h.Source,
                TransactionDate = h.TransactionDate
            });

            return Ok(response);
        }

        /// <summary>
        /// Checks if the user is eligible for today's strike and shows gift progress.
        /// </summary>
        [HttpGet("strikestatus")]
        public async Task<IActionResult> GetStrikeStatus(Guid walletId)
        {
            var hasClaimed = await transactionService.HasClaimedDailyStrikeTodayAsync(walletId);
            var purchasedTotal = await transactionService.GetTotalPurchasedPointsAsync(walletId);

            return Ok(new DailyStrikeStatusDto
            {
                AlreadyClaimedToday = hasClaimed,
                TotalPurchasedPoints = purchasedTotal
            });
        }

        /// <summary>
        /// Spends points for boosting an ad.
        /// Deducts from balance but keeps LifetimePurchasedPoints (Gift Target) safe.
        /// </summary>
        [HttpPost("spendforboost")]
        public async Task<IActionResult> SpendForBoost(Guid walletId, int points)
        {
            var transaction = await transactionService.SpendPointsAsync(
                walletId,
                points,
                PointsSource.BoostSpend);

            logger.LogInformation("Wallet {Id} spent {pts} for boosting.", walletId, points);

            return Ok(new
            {
                Message = "Points spent successfully.",
                TransactionId = transaction.Id
            });
        }
    }
}