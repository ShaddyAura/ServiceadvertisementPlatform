using Microsoft.Extensions.Configuration;
using ServAd.ApiService.Services.Payment.Interface;
using ServAd.ApiService.Services.Payment.Models;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;

namespace ServAd.ApiService.Services.Payment.Service
{
    public class PaymentService(IConfiguration configuration, HttpClient httpClient) : IPaymentService
    {
        // ── eSewa Test Sandbox ──────────────────────────────────────────
        private readonly string eSewaSecret = configuration["PaymentGateways:eSewa:SecretKey"] ?? "8gBm/:&EnhH.1/q";
        private readonly string eSewaMerchantCode = configuration["PaymentGateways:eSewa:MerchantCode"] ?? "EPAYTEST";
        private readonly string eSewaBaseUrl = configuration["PaymentGateways:eSewa:BaseUrl"] ?? "https://rc-epay.esewa.com.np";

        // ── Khalti Dev Sandbox ──────────────────────────────────────────
        private readonly string khaltiSecretKey = configuration["PaymentGateways:Khalti:SecretKey"] ?? "live_secret_key_68791341fdd94846a146f0457ff7b455";
        private readonly string khaltiBaseUrl = (configuration["PaymentGateways:Khalti:BaseUrl"] ?? "https://dev.khalti.com").TrimEnd('/') + "/api/v2/";

        // ================================================================
        //  eSewa — Generate Payment Form Data (v2)
        // ================================================================
        public EsewaPaymentData GenerateEsewaPaymentData(Guid referenceId, decimal amount, string type, string successUrl, string failureUrl)
        {
            // Appending a random nonce to bypass eSewa's Duplicate Transaction UUID block if a user cancels and tries again.
            string txUuid = $"{referenceId}_{type.ToUpper()}_{Guid.NewGuid().ToString().Substring(0, 8)}";
            string totalAmtStr = amount.ToString("0.##");

            var data = new EsewaPaymentData
            {
                Amount = totalAmtStr,
                TotalAmount = totalAmtStr,
                TransactionUuid = txUuid,
                ProductCode = eSewaMerchantCode,
                SuccessUrl = successUrl,
                FailureUrl = failureUrl
            };

            // Signature format required by eSewa v2
            string dataToSign = $"total_amount={data.TotalAmount},transaction_uuid={data.TransactionUuid},product_code={data.ProductCode}";
            data.Signature = CreateHmacSha256(dataToSign, eSewaSecret);

            return data;
        }

        // ================================================================
        //  eSewa — Verify Callback Signature
        // ================================================================
        public bool VerifyEsewaSignature(string dataToSign, string providedSignature)
        {
            string generatedSignature = CreateHmacSha256(dataToSign, eSewaSecret);
            return generatedSignature == providedSignature;
        }

        // ================================================================
        //  eSewa — Check Transaction Status via API
        // ================================================================
        public async Task<EsewaStatusResponse> CheckEsewaTransactionStatusAsync(string productCode, string totalAmount, string transactionUuid)
        {
            // GET https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=100&transaction_uuid=xxx
            var url = $"{eSewaBaseUrl}/api/epay/transaction/status/?product_code={productCode}&total_amount={totalAmount}&transaction_uuid={transactionUuid}";

            var response = await httpClient.GetAsync(url);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return new EsewaStatusResponse { Status = "FAILED", Message = json };
            }

            var result = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);
            return new EsewaStatusResponse
            {
                Status = result?.GetValueOrDefault("status").GetString() ?? "UNKNOWN",
                TransactionCode = result?.GetValueOrDefault("ref_id").GetString() ?? "",
                TotalAmount = result?.GetValueOrDefault("total_amount").ToString() ?? "0",
                Message = "OK"
            };
        }

        // ================================================================
        //  Khalti — Initiate Payment (epayment/initiate/)
        // ================================================================
        public async Task<KhaltiInitiateResponse> InitiateKhaltiPaymentAsync(Guid referenceId, decimal amount, string type, string returnUrl, string name)
        {
            var requestBody = new
            {
                return_url = returnUrl,
                website_url = "https://localhost:5173",
                amount = (int)(amount * 100), // convert NPR to paisa
                purchase_order_id = $"{referenceId}_{type.ToUpper()}",
                purchase_order_name = name,
                customer_info = new
                {
                    name = "Customer",
                    email = "customer@example.com",
                    phone = "9800000000"
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, khaltiBaseUrl + "epayment/initiate/")
            {
                Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Key", khaltiSecretKey);

            var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errInfo = await response.Content.ReadAsStringAsync();
                throw new Exception($"Khalti Initiate Error: {errInfo}");
            }

            var jsonResult = await response.Content.ReadAsStringAsync();
            var resultDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonResult);

            return new KhaltiInitiateResponse
            {
                Pidx = resultDict?["pidx"].GetString() ?? string.Empty,
                PaymentUrl = resultDict?["payment_url"].GetString() ?? string.Empty
            };
        }

        // ================================================================
        //  Khalti — Verify/Lookup Payment (epayment/lookup/)
        // ================================================================
        public async Task<bool> VerifyKhaltiPaymentAsync(string pidx)
        {
            var requestBody = new { pidx };
            var request = new HttpRequestMessage(HttpMethod.Post, khaltiBaseUrl + "epayment/lookup/")
            {
                Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Key", khaltiSecretKey);

            var response = await httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var jsonResult = await response.Content.ReadAsStringAsync();
                var resultDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonResult);
                if (resultDict != null && resultDict.TryGetValue("status", out var statusEl) && statusEl.GetString() == "Completed")
                {
                    return true;
                }
            }
            return false;
        }

        // ================================================================
        //  Utility — HMAC-SHA256 Signature for eSewa
        // ================================================================
        private static string CreateHmacSha256(string message, string secret)
        {
            var encoding = new ASCIIEncoding();
            byte[] keyByte = encoding.GetBytes(secret);
            byte[] messageBytes = encoding.GetBytes(message);

            using var hmacsha256 = new HMACSHA256(keyByte);
            byte[] hashmessage = hmacsha256.ComputeHash(messageBytes);
            return Convert.ToBase64String(hashmessage);
        }
    }
}
