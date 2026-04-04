namespace ServAd.ApiService.Services.Payment.Models
{
    // ── eSewa Form Data (sent to rc-epay.esewa.com.np) ──
    public class EsewaPaymentData
    {
        public string Amount { get; set; } = string.Empty;
        public string TaxAmount { get; set; } = "0";
        public string TotalAmount { get; set; } = string.Empty;
        public string TransactionUuid { get; set; } = string.Empty;
        public string ProductCode { get; set; } = "EPAYTEST";
        public string ProductServiceCharge { get; set; } = "0";
        public string ProductDeliveryCharge { get; set; } = "0";
        public string SuccessUrl { get; set; } = string.Empty;
        public string FailureUrl { get; set; } = string.Empty;
        public string SignedFieldNames { get; set; } = "total_amount,transaction_uuid,product_code";
        public string Signature { get; set; } = string.Empty;
    }

    // ── eSewa Transaction Status Response ──
    public class EsewaStatusResponse
    {
        public string Status { get; set; } = string.Empty;
        public string TransactionCode { get; set; } = string.Empty;
        public string TotalAmount { get; set; } = "0";
        public string Message { get; set; } = string.Empty;
    }

    // ── Khalti Initiate Response ──
    public class KhaltiInitiateResponse
    {
        public string Pidx { get; set; } = string.Empty;
        public string PaymentUrl { get; set; } = string.Empty;
    }
}
