using ServAd.ApiService.Services.Payment.Models;

namespace ServAd.ApiService.Services.Payment.Interface
{
    public interface IPaymentService
    {
        // ── Khalti ──
        Task<KhaltiInitiateResponse> InitiateKhaltiPaymentAsync(Guid referenceId, decimal amount, string type, string returnUrl, string name);
        Task<bool> VerifyKhaltiPaymentAsync(string pidx);

        // ── eSewa ──
        EsewaPaymentData GenerateEsewaPaymentData(Guid referenceId, decimal amount, string type, string successUrl, string failureUrl);
        bool VerifyEsewaSignature(string dataToSign, string providedSignature);
        Task<EsewaStatusResponse> CheckEsewaTransactionStatusAsync(string productCode, string totalAmount, string transactionUuid);
    }
}
