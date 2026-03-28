namespace ServAd.ApiService.Controllers.PointTransection.Dto
{
    public class DailyStrikeStatusDto
    {
        public bool AlreadyClaimedToday { get; set; }
        public int CurrentConsecutiveDays { get; set; }
        public decimal PointsToGain { get; set; } = 10;
        public decimal TotalPurchasedPoints { get; set; } // The high-water mark for Gifts
    }
}