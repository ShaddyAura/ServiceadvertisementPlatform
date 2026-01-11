using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ServAd.ApiService.Configuration;

namespace ServAd.ApiService.Services.Jwt
{
    public class JwtTokenService
    {
        private readonly JwtSettings _jwtSettings;

        public JwtTokenService(IOptions<JwtSettings> jwtSettings)
        {
            _jwtSettings = jwtSettings.Value;
        }

        public (string Token, long ExpiresIn) CreateToken(IEnumerable<Claim> claims)
        {
            var now = DateTime.UtcNow;

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                IssuedAt = now,
                NotBefore = now,
                Expires = now.AddMinutes(_jwtSettings.ExpiryInMinutes),
                Subject = new ClaimsIdentity(claims),
                SigningCredentials = _jwtSettings.SigningCredentials,
                EncryptingCredentials = _jwtSettings.EncryptingCredentials
            };

            var handler = new JwtSecurityTokenHandler();
            var securityToken = handler.CreateToken(tokenDescriptor);

            string tokenString = handler.WriteToken(securityToken);

            return (tokenString, _jwtSettings.ExpiryInMinutes * 60);
        }
    }
}
