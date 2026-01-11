using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace ServAd.ApiService.Services.CurrentUser
{
    public class CurrentUserService
    {
        private readonly HttpContext _httpContext;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContext = httpContextAccessor.HttpContext
                ?? throw new ArgumentNullException(nameof(httpContextAccessor.HttpContext));
        }

        // 🔹 Authenticated User ID
        public Guid UserId =>
            Guid.TryParse(
                _httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier),
                out var userId)
            ? userId
            : throw new UnauthorizedAccessException("User is not authenticated.");

        // 🔹 Email from JWT
        public string? Email =>
            _httpContext.User.FindFirstValue(ClaimTypes.Email);

        // 🔹 Role from JWT
        public string? Role =>
            _httpContext.User.FindFirstValue(ClaimTypes.Role);

        // 🔹 Check Authentication
        public bool IsAuthenticated =>
            _httpContext.User.Identity?.IsAuthenticated ?? false;
    }
}
