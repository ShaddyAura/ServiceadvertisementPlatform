using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ServAd.ApiService.Configuration;
using ServAd.ApiService.Controllers.Account.Dto;
using ServAd.ApiService.Data;
using ServAd.ApiService.Data.Entities;
using ServAd.ApiService.Services.Email;
using ServAd.ApiService.Services.Jwt;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace ServAd.ApiService.Controllers.Account
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<IdentityUser<Guid>> userManager;
        private readonly SignInManager<IdentityUser<Guid>> signInManager;
        private readonly EmailService emailService;   
        private readonly JwtTokenService jwtTokenService;
        private readonly EmailSettings emailSettings;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly ServiceDbContext _context;

        public AccountController(
            UserManager<IdentityUser<Guid>> userManager,
            SignInManager<IdentityUser<Guid>> signInManager,
            EmailService emailService,   // ✅ Updated
            JwtTokenService jwtTokenService,
            IOptions<EmailSettings> emailSettings,
            IHttpContextAccessor httpContextAccessor,
            ServiceDbContext context)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.emailService = emailService;   // ✅ Updated
            this.jwtTokenService = jwtTokenService;
            this.emailSettings = emailSettings.Value;
            this.httpContextAccessor = httpContextAccessor;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new IdentityUser<Guid>
            {
                UserName = request.Email,
                Email = request.Email,
                EmailConfirmed = false
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Save profile
            var profile = new Profiles
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                FirstName = request.FirstName,
                LastName = request.LastName,
                CreatedAt = DateTime.UtcNow
            };

            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            // --------------------------------------------------------------
            // ✅ Generate 6-digit verification code (NEW)
            // --------------------------------------------------------------
            var code = new Random().Next(100000, 999999).ToString();

            // Store OTP in Identity token storage
            await userManager.SetAuthenticationTokenAsync(
                user,
                "EmailVerification",   // Provider
                "Code",                // Token name
                code                   // Token value
            );

            // --------------------------------------------------------------
            // ✅ Send OTP Email (NEW)
            // --------------------------------------------------------------
            await emailService.SendEmailAsync(
                to: request.Email,
                subject: "Your Verification Code",
                body: $@"
               <h2>Welcome, {request.FirstName}!</h2>
               <p>Your verification code is:</p>
               <h1 style='font-size:32px;letter-spacing:4px;color:#4F46E5'>{code}</h1>
               <p>Please enter this code in the app to verify your account.</p>
                "
            );

            // --------------------------------------------------------------
            // ✅ Response
            // --------------------------------------------------------------
            return Ok(new
            {
                Message = "User registered successfully. Verification code sent.",
                Email = request.Email
            });
        }



        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status423Locked)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> LoginAsync([FromBody] LoginRequestDto dto)
        {
            var user = await userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return Problem(
                    title: "Authentication failed",
                    detail: "Invalid username or password.",
                    statusCode: StatusCodes.Status401Unauthorized);
            }

            var result = await signInManager.CheckPasswordSignInAsync(user, dto.Password, true);

            switch (result)
            {
                case { Succeeded: true }:

                    // ✅ GET ROLE FROM IDENTITY
                    var roles = await userManager.GetRolesAsync(user);
                    var role = roles.FirstOrDefault() ?? "User";

                    // ✅ ADD ROLE INTO CLAIMS (so JWT has role info too)
                    var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Role, role) // 🔥 Now JWT contains the role!
            };

                    // ✅ CREATE JWT TOKEN INCLUDING ROLE CLAIM
                    var (accessToken, expiresIn) = jwtTokenService.CreateToken(claims);

                    // ✅ SET HTTP ONLY Cookie if you still want it
                    Response.Cookies.Append("jwt", accessToken, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.None,
                        Expires = DateTime.UtcNow.AddSeconds(expiresIn) // FIXED
                    });



                    // ✅ RETURN TOKEN + ROLE TO FRONTEND
                    return Ok(new
                    {
                        accessToken,
                        expiresIn,
                        role   
                    });

                case { IsLockedOut: true }:
                    return Problem(
                        title: "Account locked",
                        detail: "Login temporarily blocked due to failed attempts.",
                        statusCode: StatusCodes.Status423Locked);

                case { IsNotAllowed: true }:
                    return Problem(
                        title: "Login not allowed",
                        detail: "Please confirm your account before login.",
                        statusCode: StatusCodes.Status403Forbidden);

                case { RequiresTwoFactor: true }:
                    return Problem(
                        title: "Two-factor required",
                        detail: "A second authentication factor is needed.",
                        statusCode: StatusCodes.Status401Unauthorized);

                default:
                    return Problem(
                        title: "Authentication failed",
                        detail: "Invalid username or password.",
                        statusCode: StatusCodes.Status401Unauthorized);
            }
        }

        // ---------------------------------------------------------------------
        // 🔵 FORGOT PASSWORD
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequestDto request)
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return NotFound("User not found.");

            var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);

            var frontendUrl = "https://localhost:5173/reset-password";
            var resetLink = $"{frontendUrl}?email={WebUtility.UrlEncode(request.Email)}&token={WebUtility.UrlEncode(resetToken)}";



            //var baseUrl = $"{httpContextAccessor.HttpContext.Request.Scheme}://{httpContextAccessor.HttpContext.Request.Host}";



            await emailService.SendEmailAsync(
                to: request.Email,
                subject: "🔑 Reset Your Password",
                body: $"<p>Click <a href='{resetLink}'>here</a> to reset your password.</p>"
            );

            return Ok("Password reset email sent.");
        }

        // ---------------------------------------------------------------------
        // 🟣 RESET PASSWORD
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequestDto request)
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return NotFound("User not found.");

            var result = await userManager.ResetPasswordAsync(user, request.ResetCode, request.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // You can customize the URL based on your frontend route (e.g., login page)
            var redirectUrl = "https://localhost:5173/login";  // Redirect to the login page after reset

            return Ok(new
            {
                Message = "Password has been reset successfully.",
                RedirectUrl = redirectUrl
            });
        }


        // ---------------------------------------------------------------------
        // 🟤 RESEND CONFIRMATION EMAIL
        [HttpPost("resend-code")]
        public async Task<IActionResult> ResendVerificationCode(ResendVerificationCodeDto req)
        {
            var user = await userManager.FindByEmailAsync(req.Email);
            if (user == null)
                return NotFound("User not found.");

            if (user.EmailConfirmed)
                return BadRequest("Email already confirmed.");

            var code = new Random().Next(100000, 999999).ToString();

            await userManager.SetAuthenticationTokenAsync(
                user,
                "EmailVerification",
                "Code",
                code
            );

            await emailService.SendEmailAsync(
                req.Email,
                "Your verification code",
                $"<p>Your verification code is <b>{code}</b></p>"
            );

            return Ok(new { Message = "Verification code sent" });
        }



        //// ---------------------------------------------------------------------
        //// ✅ CONFIRM EMAIL
        //[HttpGet("confirm-email")]
        //public async Task<IActionResult> ConfirmEmail(string email, string token)
        //{
        //    var user = await userManager.FindByEmailAsync(email);
        //    if (user == null)
        //        return NotFound("User not found.");

        //    var decodedToken = WebUtility.UrlDecode(token);

        //    var result = await userManager.ConfirmEmailAsync(user, decodedToken);

        //    if (!result.Succeeded)
        //        return BadRequest("Invalid or expired token.");

        //    return Ok("Email confirmed successfully!");
        //}


        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var redirectUrl = Url.Action("ExternalLoginCallback", "Account", null, Request.Scheme);
            var properties = signInManager.ConfigureExternalAuthenticationProperties(
                GoogleDefaults.AuthenticationScheme,
                redirectUrl
            );

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("ExternalLoginCallback")]
        public async Task<IActionResult> ExternalLoginCallback(string? error = null)
        {
            if (!string.IsNullOrEmpty(error))
            {
                // Handle error when user denies the login or cancels
                return Redirect("https://localhost:5173/login?error=access_denied");
            }

            var info = await signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                // Handle case where info is null (user canceled the login)
                return Redirect("https://localhost:5173/login?error=google_failed");
            }

            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email))
            {
                return Redirect("https://localhost:5173/login?error=email_missing");
            }

            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new IdentityUser<Guid>
                {
                    Email = email,
                    UserName = email,
                    EmailConfirmed = true
                };

                var createRes = await userManager.CreateAsync(user);
                if (!createRes.Succeeded)
                {
                    return Redirect("https://localhost:5173/login?error=server_error");
                }

                await userManager.AddLoginAsync(user, info);
            }

            var roles = await userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "User";

            var claims = new List<Claim>
    {
              new Claim(ClaimTypes.Email, email),
              new Claim(ClaimTypes.Role, role)
    };

            var (jwt, expiresInSeconds) = jwtTokenService.CreateToken(claims);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddSeconds(expiresInSeconds)
            };

            Response.Cookies.Append("jwt", jwt, cookieOptions);

            return Redirect("https://localhost:5173/auth/callback");
        }

        [HttpPost("verify-email-code")]
        public async Task<IActionResult> VerifyEmailCode([FromBody] VerifyCodeRequestDto req)
        {
            var user = await userManager.FindByEmailAsync(req.Email);
            if (user == null)
                return BadRequest("User not found");

            var savedCode = await userManager.GetAuthenticationTokenAsync(
                user,
                "EmailVerification",
                "Code"
            );

            if (savedCode == null)
                return BadRequest("No verification code found. Request a new one.");

            if (savedCode != req.Code)
                return BadRequest("Invalid code");

            user.EmailConfirmed = true;
            await userManager.UpdateAsync(user);

            // Remove used OTP
            await userManager.RemoveAuthenticationTokenAsync(
                user,
                "EmailVerification",
                "Code"
            );

            return Ok(new { Message = "Email verified successfully" });
        }




        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt");
            return Ok(new { message = "Logged out" });
        }

        [HttpGet("me")]
        public IActionResult Me([FromServices] IOptions<JwtSettings> jwtSettings)
        {
            var token = Request.Cookies["jwt"];
            if (token == null)
                return Unauthorized();

            var settings = jwtSettings.Value;

            var handler = new JwtSecurityTokenHandler();

            var validationParams = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = false, // You can enable if needed

                ValidIssuer = settings.Issuer,
                ValidAudience = settings.Audience,

                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(settings.SigningKey)
                ),

                // 🔥 REQUIRED: decrypt the encrypted JWT
                TokenDecryptionKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(settings.EncryptingKey)
                )
            };

            try
            {
                var principal = handler.ValidateToken(token, validationParams, out var validatedToken);

                var email = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
                var role = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

                return Ok(new { email, role });
            }
              catch (Exception ex)
            {
                return Unauthorized(new { message = "Invalid token", error = ex.Message });
            }
        }


    }
}
