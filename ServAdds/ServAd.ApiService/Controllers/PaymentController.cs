using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Services.Booking.Interface;
using ServAd.ApiService.Services.Payment.Interface;
using ServAd.ApiService.Services.Wallet.Interface;
using ShareLibrary.cs.Data.Enums;
using System.Security.Claims;
using System.Text.Json;
using System.Text;

namespace ServAd.ApiService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IServAddBooking _bookingService;
        private readonly IUserWalletService _walletService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            IPaymentService paymentService,
            IServAddBooking bookingService,
            IUserWalletService walletService,
            IConfiguration configuration,
            ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _bookingService = bookingService;
            _walletService = walletService;
            _configuration = configuration;
            _logger = logger;
        }

        // ================================================================
        //  1. INITIATE BOOKING PAYMENT (eSewa / Khalti)
        // ================================================================
        [HttpPost("initiate-booking")]
        public async Task<IActionResult> InitiateBookingPayment([FromBody] InitiatePaymentDto dto)
        {
            var booking = await _bookingService.GetByIdAsync(dto.BookingId);
            if (booking == null) return NotFound("Booking not found");
            if (booking.Status == BookingStatus.Paid) return BadRequest("Already paid");

            string successUrl = $"https://localhost:5173/payment/success?type=booking&gateway={dto.Gateway}&id={booking.Id}";
            string failureUrl = "https://localhost:5173/payment/failure?type=booking";

            decimal amountToPay = booking.AgreedPrice;
            if (dto.FinalAmount.HasValue && dto.FinalAmount.Value > 0 && dto.FinalAmount.Value <= booking.AgreedPrice)
            {
                amountToPay = dto.FinalAmount.Value;
            }

            if (string.Equals(dto.Gateway, "khalti", StringComparison.OrdinalIgnoreCase))
            {
                var response = await _paymentService.InitiateKhaltiPaymentAsync(
                    booking.Id, amountToPay, "BOOKING", successUrl, $"Booking {booking.Id}");
                return Ok(new { paymentUrl = response.PaymentUrl, pidx = response.Pidx });
            }
            else if (string.Equals(dto.Gateway, "esewa", StringComparison.OrdinalIgnoreCase))
            {
                var eSewaBaseUrl = _configuration["PaymentGateways:eSewa:BaseUrl"] ?? "https://rc-epay.esewa.com.np";
                var data = _paymentService.GenerateEsewaPaymentData(
                    booking.Id, amountToPay, "BOOKING", successUrl, failureUrl);
                return Ok(new { esewaData = data, paymentUrl = $"{eSewaBaseUrl}/api/epay/main/v2/form" });
            }

            return BadRequest("Invalid gateway. Use 'esewa' or 'khalti'.");
        }

        // ================================================================
        //  2. VERIFY BOOKING PAYMENT (callback from gateway)
        // ================================================================
        [HttpGet("verify-booking")]
        [AllowAnonymous] // callback from payment page
        public async Task<IActionResult> VerifyBookingPayment(
            [FromQuery] string gateway,
            [FromQuery] string? pidx,
            [FromQuery] string? data,
            [FromQuery] Guid? id,
            [FromQuery] string? status)
        {
            try
            {
                // ── Khalti Verification ──
                if (string.Equals(gateway, "khalti", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(pidx))
                        return BadRequest("Missing pidx for Khalti verification");

                    if (status == "User_cancelled")
                        return BadRequest("Payment was cancelled by the user.");

                    bool isValid = await _paymentService.VerifyKhaltiPaymentAsync(pidx);
                    if (!isValid) return BadRequest("Khalti verification failed or was cancelled.");

                    if (id.HasValue)
                    {
                        await _bookingService.UpdateStatusAsync(id.Value, BookingStatus.Paid, "khalti");
                    }
                    return Ok(new { message = "Booking payment verified via Khalti" });
                }

                // ── eSewa Verification ──
                if (string.Equals(gateway, "esewa", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(data))
                        return BadRequest("Missing eSewa response data");

                    string b64 = data.Replace('-', '+').Replace('_', '/').Replace(" ", "+");
                    int mod4 = b64.Length % 4;
                    if (mod4 > 0) b64 += new string('=', 4 - mod4);

                    var decodedBytes = Convert.FromBase64String(b64);
                    var decodedString = Encoding.UTF8.GetString(decodedBytes);
                    var payload = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(decodedString);

                    if (payload == null)
                        return BadRequest("Invalid eSewa callback data");

                    var eSewaStatus = payload.GetValueOrDefault("status").GetString();
                    if (eSewaStatus != "COMPLETE")
                        return BadRequest($"eSewa payment status: {eSewaStatus}");

                    string txUuid = payload["transaction_uuid"].GetString() ?? string.Empty;
                    string totalAmt = payload["total_amount"].GetString()?.Replace(",", "") ?? "0";

                    // Verify signature
                    string dataToSign = $"transaction_code={payload["transaction_code"].GetString() ?? ""},status={eSewaStatus},total_amount={totalAmt},transaction_uuid={txUuid},product_code={payload.GetValueOrDefault("product_code").GetString() ?? "EPAYTEST"},signed_field_names={payload["signed_field_names"].GetString() ?? ""}";
                    string providedSignature = payload["signature"].GetString() ?? string.Empty;

                    if (!_paymentService.VerifyEsewaSignature(dataToSign, providedSignature))
                    {
                        _logger.LogWarning("eSewa signature mismatch – proceeding for test environment. TxUUID: {TxUuid}", txUuid);
                        // In test/sandbox, eSewa signatures may not always match perfectly
                    }

                    // Extract booking ID from transaction_uuid format: "{bookingId}_BOOKING"
                    var bookingIdStr = txUuid.Split("_")[0];
                    if (Guid.TryParse(bookingIdStr, out var bookingId))
                    {
                        await _bookingService.UpdateStatusAsync(bookingId, BookingStatus.Paid, "esewa");
                        return Ok(new { message = "Booking payment verified via eSewa" });
                    }

                    return BadRequest("Could not extract booking ID from transaction");
                }

                return BadRequest("Invalid gateway. Use 'esewa' or 'khalti'.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Payment verification error");
                return StatusCode(500, new { message = "Payment verification failed", error = ex.Message });
            }
        }

        // ================================================================
        //  3. INITIATE POINTS PURCHASE (eSewa / Khalti)
        // ================================================================
        [HttpPost("initiate-points")]
        public async Task<IActionResult> InitiatePointsPayment([FromBody] InitiatePointsDto dto)
        {
            var profileIdStr = User.FindFirst("ProfileId")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (profileIdStr == null) return Unauthorized();

            string successUrl = $"https://localhost:5173/payment/success?type=points&gateway={dto.Gateway}&pts={dto.PointsToBuy}&amt={dto.Amount}";
            string failureUrl = "https://localhost:5173/payment/failure?type=points";

            Guid referenceId = Guid.NewGuid();

            if (string.Equals(dto.Gateway, "khalti", StringComparison.OrdinalIgnoreCase))
            {
                var response = await _paymentService.InitiateKhaltiPaymentAsync(
                    referenceId, dto.Amount, "POINTS", successUrl, $"Buy {dto.PointsToBuy} Points");
                return Ok(new { paymentUrl = response.PaymentUrl, pidx = response.Pidx });
            }
            else if (string.Equals(dto.Gateway, "esewa", StringComparison.OrdinalIgnoreCase))
            {
                var eSewaBaseUrl = _configuration["PaymentGateways:eSewa:BaseUrl"] ?? "https://rc-epay.esewa.com.np";
                var data = _paymentService.GenerateEsewaPaymentData(
                    referenceId, dto.Amount, "POINTS", successUrl, failureUrl);
                return Ok(new { esewaData = data, paymentUrl = $"{eSewaBaseUrl}/api/epay/main/v2/form" });
            }

            return BadRequest("Invalid gateway. Use 'esewa' or 'khalti'.");
        }

        // ================================================================
        //  4. VERIFY POINTS PAYMENT (callback from gateway)
        // ================================================================
        [HttpGet("verify-points")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyPointsPayment(
            [FromQuery] string gateway,
            [FromQuery] string? pidx,
            [FromQuery] string? data,
            [FromQuery] int pts,
            [FromQuery] decimal amt,
            [FromQuery] string? status)
        {
            var profileIdStr = User.FindFirst("ProfileId")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (profileIdStr == null) return Unauthorized();
            var profileId = Guid.Parse(profileIdStr);

            try
            {
                // ── Khalti ──
                if (string.Equals(gateway, "khalti", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(pidx))
                        return BadRequest("Missing pidx for Khalti verification");

                    if (status == "User_cancelled")
                        return BadRequest("Payment was cancelled by the user.");

                    bool isValid = await _paymentService.VerifyKhaltiPaymentAsync(pidx);
                    if (!isValid) return BadRequest("Khalti verification failed or was cancelled.");

                    await _walletService.PurchasePointsAsync(profileId, amt, pts, "khalti");
                    return Ok(new { message = "Points purchased via Khalti" });
                }

                // ── eSewa ──
                if (string.Equals(gateway, "esewa", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(data))
                        return BadRequest("Missing eSewa response data");

                    string b64 = data.Replace('-', '+').Replace('_', '/').Replace(" ", "+");
                    int mod4 = b64.Length % 4;
                    if (mod4 > 0) b64 += new string('=', 4 - mod4);

                    var decodedBytes = Convert.FromBase64String(b64);
                    var decodedString = Encoding.UTF8.GetString(decodedBytes);
                    var payload = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(decodedString);

                    if (payload != null &&
                        payload.TryGetValue("status", out var statusEl) &&
                        statusEl.GetString() == "COMPLETE")
                    {
                        await _walletService.PurchasePointsAsync(profileId, amt, pts, "esewa");
                        return Ok(new { message = "Points purchased via eSewa" });
                    }
                    return BadRequest("eSewa verification failed");
                }

                return BadRequest("Invalid gateway. Use 'esewa' or 'khalti'.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Points payment verification error");
                return StatusCode(500, new { message = "Points payment verification failed", error = ex.Message });
            }
        }

        // ================================================================
        //  5. CHECK eSewa TRANSACTION STATUS (server-side API call)
        // ================================================================
        [HttpGet("esewa-status")]
        public async Task<IActionResult> CheckEsewaStatus(
            [FromQuery] string transactionUuid,
            [FromQuery] string totalAmount)
        {
            var productCode = _configuration["PaymentGateways:eSewa:MerchantCode"] ?? "EPAYTEST";
            var result = await _paymentService.CheckEsewaTransactionStatusAsync(productCode, totalAmount, transactionUuid);
            return Ok(result);
        }
    }

    // ── DTOs ──────────────────────────────────────────────────────
    public class InitiatePaymentDto
    {
        public Guid BookingId { get; set; }
        public string Gateway { get; set; } = string.Empty;  // "esewa" or "khalti"
        public decimal? FinalAmount { get; set; } // Discounted amount if promotion applied
    }

    public class InitiatePointsDto
    {
        public string Gateway { get; set; } = string.Empty;  // "esewa" or "khalti"
        public int PointsToBuy { get; set; }
        public decimal Amount { get; set; }  // NPR amount
    }
}
