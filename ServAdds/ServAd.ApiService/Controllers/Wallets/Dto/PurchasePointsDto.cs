namespace ServAd.ApiService.Controllers.Wallets.Dto
{
    public class PurchasePointsDto
    {
        public Guid ProfileId { get; set; }
        public decimal Amount { get; set; }
        public decimal PointsToGive { get; set; }
        public string Gateway { get; set; } = string.Empty;
    }
}
