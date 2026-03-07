namespace ServAd.ApiService.Controllers.PointTransection.Dto
{
    public class DailyStrikeStatusDto
    {
        public bool AlreadyClaimedToday { get; set; }
        public int CurrentConsecutiveDays { get; set; }
        public int PointsToGain { get; set; } = 10;
        public int TotalPurchasedPoints { get; set; } // The high-water mark for Gifts
    }
}