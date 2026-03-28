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
        // ESEWA configurations
        private readonly string eSewaSecret = configuration["PaymentGateways:eSewa:client_secret"] ?? "8gBm/:&EnhH.1/q";
        private readonly string eSewaMerchantCode = "EPAYTEST"; // Standard for testing

        // KHALTI configurations
        private readonly string khaltiSecretKey = configuration["PaymentGateways:Khalti:SecretKey"] ?? "test_secret_key_placeholder";
        private readonly string khaltiBaseUrl = "https://a.khalti.com/api/v2/";

        public EsewaPaymentData GenerateEsewaPaymentData(Guid referenceId, decimal amount, string type, string successUrl, string failureUrl)
        {
            string txUuid = $"{referenceId}_{type.ToUpper()}";
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

            // Data format: total_amount=100,transaction_uuid=ab12,product_code=EPAYTEST
            string dataToSign = $"total_amount={data.TotalAmount},transaction_uuid={data.TransactionUuid},product_code={data.ProductCode}";
            
            data.Signature = CreateHmacSha256(dataToSign, eSewaSecret);
            return data;
        }

        public bool VerifyEsewaSignature(string dataToSign, string providedSignature)
        {
            string generatedSignature = CreateHmacSha256(dataToSign, eSewaSecret);
            return generatedSignature == providedSignature;
        }

        private static string CreateHmacSha256(string message, string secret)
        {
            var encoding = new ASCIIEncoding();
            byte[] keyByte = encoding.GetBytes(secret);
            byte[] messageBytes = encoding.GetBytes(message);

            using (var hmacsha256 = new HMACSHA256(keyByte))
            {
                byte[] hashmessage = hmacsha256.ComputeHash(messageBytes);
                return Convert.ToBase64String(hashmessage);
            }
        }

        public async Task<KhaltiInitiateResponse> InitiateKhaltiPaymentAsync(Guid referenceId, decimal amount, string type, string returnUrl, string name)
        {
            var requestBody = new
            {
                return_url = returnUrl,
                website_url = "https://localhost:5173",
                amount = (int)(amount * 100), // convert to paisa
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

        public async Task<bool> VerifyKhaltiPaymentAsync(string pidx)
        {
            var requestBody = new { pidx = pidx };
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
    }
}
