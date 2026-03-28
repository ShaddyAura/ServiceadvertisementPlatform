using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Controllers.PointTransection.Dto
{
    public class TransactionHistoryDto
    {
        public Guid TransactionId { get; set; }
        public decimal Amount { get; set; } 
        public PointsSource Source { get; set; }
        public DateTime TransactionDate { get; set; }
        public string SourceName => Source.ToString();
    }
}