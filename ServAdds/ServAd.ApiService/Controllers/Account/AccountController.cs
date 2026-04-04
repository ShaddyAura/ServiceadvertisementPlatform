using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ServAd.ApiService.Configuration;
using ServAd.ApiService.Controllers.Account.Dto;
using ServAd.ApiService.Services.Email;
using ServAd.ApiService.Services.Jwt;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
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

            // 1. Validate that the requested role is allowed for public registration
            var allowedRoles = new[] { "User", "ServiceProvider" };
            if (!allowedRoles.Contains(request.UserType))
            {
                return BadRequest(new { Message = "Invalid UserType. Must be 'User' or 'ServiceProvider'." });
            }

            var user = new IdentityUser<Guid>
            {
                UserName = request.Email,
                Email = request.Email,
                EmailConfirmed = false
            };

            // 2. Create the User
            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // 3. ✅ ASSIGN ROLE
            // This adds an entry to the AspNetUserRoles table
            var roleResult = await userManager.AddToRoleAsync(user, request.UserType);
            if (!roleResult.Succeeded)
            {
                // Optional: Delete user if role assignment fails to maintain data integrity
                await userManager.DeleteAsync(user);
                return BadRequest(roleResult.Errors);
            }

            // 4. Save profile
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
            // ✅ Generate 6-digit verification code
            // --------------------------------------------------------------
            var code = new Random().Next(100000, 999999).ToString();

            // Store OTP in Identity token storage
            await userManager.SetAuthenticationTokenAsync(
                user,
                "EmailVerification",
                "Code",
                code
            );

            // --------------------------------------------------------------
            // ✅ Send OTP Email
            // --------------------------------------------------------------
            await emailService.SendEmailAsync(
                to: request.Email,
                subject: "Your Verification Code",
                body: $@"
        <h2>Welcome, {request.FirstName}!</h2>
        <p>You have successfully registered as a <strong>{request.UserType}</strong>.</p>
        <p>Your verification code is:</p>
        <h1 style='font-size:32px;letter-spacing:4px;color:#4F46E5'>{code}</h1>
        <p>Please enter this code in the app to verify your account.</p>"
            );

            return Ok(new
            {
                Message = "User registered successfully. Verification code sent.",
                Email = request.Email,
                Role = request.UserType
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
                        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                        new Claim(ClaimTypes.Email, user.Email!),
                        new Claim(ClaimTypes.Role, role),
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                        //new Claim(ClaimTypes.Role, role) // 🔥 Now JWT contains the role!
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
        public IActionResult GoogleLogin(string userType = "User") // Default to User
        {
            var redirectUrl = Url.Action("ExternalLoginCallback", "Account", null, Request.Scheme);

            var properties = signInManager.ConfigureExternalAuthenticationProperties(
                GoogleDefaults.AuthenticationScheme,
                redirectUrl
            );

            // 🔥 Store the role in the 'Items' dictionary so it survives the round-trip to Google
            properties.Items["UserType"] = userType;

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("ExternalLoginCallback")]
        public async Task<IActionResult> ExternalLoginCallback(string? error = null)
        {
            if (!string.IsNullOrEmpty(error))
                return Redirect("https://localhost:5173/login?error=access_denied");

            var info = await signInManager.GetExternalLoginInfoAsync();
            if (info == null)
                return Redirect("https://localhost:5173/login?error=google_failed");

            // 🔥 Retrieve the role we stored earlier
            var requestedRole = info.AuthenticationProperties?.Items["UserType"] ?? "User";

            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email))
                return Redirect("https://localhost:5173/login?error=email_missing");

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
                    return Redirect("https://localhost:5173/login?error=server_error");

                await userManager.AddLoginAsync(user, info);

                // ✅ ASSIGN THE ROLE TO NEW USER
                await userManager.AddToRoleAsync(user, requestedRole);
            }

            // ✅ ENSURE PROFILE EXISTS (Fixes missing Profile crashes)
            var profileExists = await _context.Profiles.AnyAsync(p => p.UserId == user.Id);
            if (!profileExists)
            {
                var firstName = info.Principal.FindFirstValue(ClaimTypes.GivenName) ?? email.Split('@')[0];
                var lastName = info.Principal.FindFirstValue(ClaimTypes.Surname) ?? "";

                var profile = new Profiles
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    FirstName = firstName,
                    LastName = lastName,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Profiles.Add(profile);
                await _context.SaveChangesAsync();
            }

            // Existing logic to get roles for the JWT
            var roles = await userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "User";

            var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
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

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return NotFound("User not found.");

            var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { Message = "Password changed successfully." });
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me([FromServices] IOptions<JwtSettings> jwtSettings)
        {
            var token = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(token))
                return Unauthorized();

            var settings = jwtSettings.Value;
            var handler = new JwtSecurityTokenHandler();

            var validationParams = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                ValidIssuer = settings.Issuer,
                ValidAudience = settings.Audience,
                RoleClaimType = ClaimTypes.Role,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(settings.SigningKey)
                ),
                TokenDecryptionKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(settings.EncryptingKey ?? string.Empty)
                )
            };

            try
            {
                var principal = handler.ValidateToken(token, validationParams, out _);

                var email = principal.FindFirst(ClaimTypes.Email)?.Value;
                var role = principal.FindFirst(ClaimTypes.Role)?.Value;
                //new Claim(ClaimTypes.Role, "Admin");
                var userIdClaim =
                principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
                principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;


                if (userIdClaim == null)
                    return Unauthorized();

                var userId = Guid.Parse(userIdClaim);

                var profile = await _context.Profiles
               .Where(p => p.UserId == userId)
               .Select(p => new
               {
                      p.Id,
                       FullName = p.FirstName + " " + p.LastName
               })
                .FirstOrDefaultAsync();

                return Ok(new
                {
                    id = userId,
                    
                    email,
                    role,
                    profileId = profile?.Id,
                    fullName = profile?.FullName
                });

            }
            catch
            {
                return Unauthorized(new { message = "Session expired" });
            }
        }

    }
}
