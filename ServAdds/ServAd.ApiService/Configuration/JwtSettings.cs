using System.ComponentModel.DataAnnotations;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace ServAd.ApiService.Configuration
{
    public class JwtSettings
    {
        public const string SectionName = "Jwt";

        [Required]
        public string Issuer { get; set; } = null!;

        [Required]
        public string Audience { get; set; } = null!;

        [Required, Range(1, int.MaxValue)]
        public int ExpiryInMinutes { get; set; }

        // Must be at least 32 chars for HMAC-SHA256
        [Required, MinLength(32)]
        public string SigningKey { get; set; } = null!;

        // Optional 16-byte key for token encryption (AES-128)
        [StringLength(16, MinimumLength = 16)]
        public string? EncryptingKey { get; set; }

        // Signing credentials
        public SigningCredentials SigningCredentials =>
            new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
                SecurityAlgorithms.HmacSha256
            );

        // Encryption credentials (optional)
        public EncryptingCredentials? EncryptingCredentials =>
            EncryptingKey is null
                ? null
                : new EncryptingCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(EncryptingKey)),
                    SecurityAlgorithms.Aes128KW,
                    SecurityAlgorithms.Aes128CbcHmacSha256
                );
    }
}
