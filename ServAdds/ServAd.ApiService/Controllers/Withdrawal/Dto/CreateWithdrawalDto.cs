namespace ServAd.ApiService.Controllers.Withdrawal.Dto
{
    public class CreateWithdrawalDto
    {
        public Guid ProfileId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string AccountDetails { get; set; } = string.Empty;
    }
}
