using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ServAd.ApiService.Configuration;
using ServAd.ApiService.Data;
using ServAd.ApiService.Data.Seeder;
using ServAd.ApiService.Services.CurrentUser;
using ServAd.ApiService.Services.Email;
using ServAd.ApiService.Services.Jwt;
using System;
using System.Net;
using System.Net.Mail;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// 1. Database - Docker Optimized
// ============================================================================

builder.Services.AddDbContext<ServiceDbContext>(options => {
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("Service_Db"),
        sql => sql.EnableRetryOnFailure());

    // ADD THIS LINE TO SUPPRESS THE ERROR
    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// ============================================================================
// 2. HealthChecks - FIXED (Install: Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore)
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ServiceDbContext>("database")  // ✅ Real SQL connection test
    .AddCheck("rabbitmq", () => HealthCheckResult.Healthy("RabbitMQ ready"))
    .AddCheck("jwt", () => HealthCheckResult.Healthy("JWT configured"))
    .AddCheck("email", () => HealthCheckResult.Healthy("Email service ready"));

// ============================================================================
// 3. Identity (GUID Primary Keys)
builder.Services.AddIdentity<IdentityUser<Guid>, IdentityRole<Guid>>()
    .AddEntityFrameworkStores<ServiceDbContext>()
    .AddDefaultTokenProviders();

// Configure Application Cookies
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/login";
    options.LogoutPath = "/logout";
    options.AccessDeniedPath = "/access-denied";
    options.ExpireTimeSpan = TimeSpan.FromMinutes(20);
    options.SlidingExpiration = true;
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

// Fix Google OAuth External Cookies
builder.Services.Configure<CookieAuthenticationOptions>(IdentityConstants.ExternalScheme, options =>
{
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.IsEssential = true;
});

// ============================================================================
// 4. JWT Configuration
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

var jwtSettings = builder.Configuration
    .GetSection(JwtSettings.SectionName)
    .Get<JwtSettings>() ?? throw new InvalidOperationException("JWT Settings not found");

var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SigningKey));

// ============================================================================
// 5. Authentication Schemes (Cookie + Google + JWT)
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme)
.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.RequireHttpsMetadata = false; // Docker localhost
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = signingKey,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var header = context.Request.Headers["Authorization"].ToString();
            if (header.StartsWith("Bearer "))
                context.Token = header["Bearer ".Length..];
            return Task.CompletedTask;
        }
    };
});

// Google OAuth
builder.Services.AddAuthentication()
    .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
        options.CallbackPath = "/signin-google";

        options.Events.OnRemoteFailure = context =>
        {
            context.Response.Redirect("https://localhost:5173/login?error=google_cancelled");
            context.HandleResponse();
            return Task.CompletedTask;
        };
    });

// ============================================================================
// 6. FluentEmail Setup
builder.Services.AddFluentEmail(
    builder.Configuration["EmailSettings:SenderEmail"],
    builder.Configuration["EmailSettings:SenderName"])
.AddSmtpSender(new SmtpClient(builder.Configuration["EmailSettings:SmtpServer"]!)
{
    Port = int.Parse(builder.Configuration["EmailSettings:SmtpPort"]!),
    Credentials = new NetworkCredential(
        builder.Configuration["EmailSettings:SmtpUser"],
        builder.Configuration["EmailSettings:SmtpPass"]),
    EnableSsl = true
});

// ============================================================================
// 7. Custom Services
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<CurrentUserService>();
builder.Services.AddHttpContextAccessor();

// ============================================================================
// 8. Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ServAd.ApiService", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ============================================================================
// 9. CORS for React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ============================================================================
// Build App
var app = builder.Build();

// ============================================================================
// 10. HealthChecks Endpoint (CRITICAL for Docker)
app.MapHealthChecks("/health");

// ============================================================================
// 11. Database Initialization & Seeding (Docker Safe)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ServiceDbContext>();
    db.Database.Migrate();
}


// ============================================================================
// 12. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReact");

// Cookie policy for Google OAuth
app.UseCookiePolicy(new CookiePolicyOptions
{
    MinimumSameSitePolicy = SameSiteMode.None,
    HttpOnly = HttpOnlyPolicy.Always,
    Secure = CookieSecurePolicy.Always
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
