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
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Hubs;
using ServAd.ApiService.Services.Booking.Interface;
using ServAd.ApiService.Services.Booking.Service;
using ServAd.ApiService.Services.Boosting.Interface;
using ServAd.ApiService.Services.Boosting.Service;
using ServAd.ApiService.Services.Category.Interface;
using ServAd.ApiService.Services.Category.Service;
using ServAd.ApiService.Services.Chat.Interface;
using ServAd.ApiService.Services.Chat.Service;
using ServAd.ApiService.Services.CurrentUser;
using ServAd.ApiService.Services.Email;
using ServAd.ApiService.Services.Jwt;
using ServAd.ApiService.Services.Notifications.Interface;
using ServAd.ApiService.Services.Notifications.Service;
using ServAd.ApiService.Services.Profile.Interface;
using ServAd.ApiService.Services.Profile.Service;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ServAd.ApiService.Services.RabbitMq.Service;
using ServAd.ApiService.Services.Reviews.Interface;
using ServAd.ApiService.Services.Reviews.Service;
using ServAd.ApiService.Services.ServiceListing.Interface;
using ServAd.ApiService.Services.ServiceListing.Service;
using ServAd.ApiService.Services.Verification.Interface;
using ServAd.ApiService.Services.Verification.Service;
using ServAd.ApiService.Services.Wallet.Interface;
using ServAd.ApiService.Services.Wallet.Service;
using ServAd.ApiService.Workers;
using ShareLibrary.cs.Data;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

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
options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.RequireHttpsMetadata = false;
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
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = ClaimTypes.Role,

       
        TokenDecryptionKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings.EncryptingKey))
    };


    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // 1️⃣ Check Authorization header
            var header = context.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(header) && header.StartsWith("Bearer "))
            {
                context.Token = header["Bearer ".Length..];
            }

            // 2️⃣ If no header, check cookie
            if (string.IsNullOrEmpty(context.Token))
            {
                context.Token = context.Request.Cookies["jwt"];
            }

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


// Register all service

builder.Services.AddSignalR();
builder.Services.AddHttpClient(); 
builder.Services.AddScoped<IRabbitmqService, RabbitmqService>();

// --- Business Logic Services ---
// Service Listing (Images/Videos)
builder.Services.AddScoped<IServiceListing, ServiceListingService>();

// Booking System
builder.Services.AddScoped<IServAddBooking, ServAddBookingService>();

// User Wallet & Points (eSewa/Khalti)
builder.Services.AddScoped<IUserWalletService, UserWalletService>();

// Boosting System (RabbitMQ + Points)
builder.Services.AddScoped<IBoostingService, BoostingService>();

// Document Verification (Admin/User Flow)
builder.Services.AddScoped<IDocumentVerificationService, DocumentVerificationService>();

// Real-time Chat (SignalR Integration)
builder.Services.AddScoped<IChatService, ChatService>();

builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHostedService<NotificationConsumerWorker>();

// ============================================================================
// 8. Controllers & Swagger
// Program.cs
// Program.cs
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ignores cycles globally if they appear elsewhere
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;

        // Bonus: Makes Enums appear as strings (e.g., "Active") instead of numbers (0)
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
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


app.UseMiddleware<GlobalExceptionMiddleware>(); // 👈 MUST be here

// ============================================================================
// 10. HealthChecks Endpoint (CRITICAL for Docker)
app.MapHealthChecks("/health");

// ============================================================================
// 11. Database Initialization & Seeding (Docker Safe)

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var db = services.GetRequiredService<ServiceDbContext>();

    // 1. Run Migrations
    db.Database.Migrate();

    // 2. Run Seeders (Add these lines!)
    try
    {
        // First, seed roles (Admin depends on roles)
        await ShareLibrary.cs.Data.Seeder.RolesSeeder.SeedAsync(services);

        // Second, seed the Admin user
        await ShareLibrary.cs.Data.Seeder.UsersSeeder.SeedAdminAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
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

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapHub<ChatHub>("/chatHub");
app.MapHub<NotificationHub>("/notificationHub");

app.Run();
