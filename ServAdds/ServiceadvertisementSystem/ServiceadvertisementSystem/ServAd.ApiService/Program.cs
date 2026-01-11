using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ServAd.ApiService.Configuration;
using ServAd.ApiService.Data;
using ServAd.ApiService.Data.Seeder;
using ServAd.ApiService.Services.CurrentUser;
using ServAd.ApiService.Services.Email;
using ServAd.ApiService.Services.Jwt;
using System.Net;
using System.Net.Mail;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// 1. Database
builder.Services.AddDbContext<ServiceDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Service_Db")));

// ============================================================================
// 2. Identity (GUID)
builder.Services.AddIdentity<IdentityUser<Guid>, IdentityRole<Guid>>()
    .AddEntityFrameworkStores<ServiceDbContext>()
    .AddDefaultTokenProviders();

// Configure Main Application Cookie
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

// Fix External Login Cookie (Google OAuth)
builder.Services.Configure<CookieAuthenticationOptions>(IdentityConstants.ExternalScheme, options =>
{
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.IsEssential = true;
});

// ============================================================================
// 3. JWT Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

var jwtSettings = builder.Configuration
    .GetSection(JwtSettings.SectionName)
    .Get<JwtSettings>();

var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SigningKey));

// ============================================================================
// 4. Authentication (Cookie + Google + JWT)
builder.Services.AddAuthentication(options =>
{
    // Default auth = Cookies
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;

    // Default challenge = Google login page
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme)
.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.RequireHttpsMetadata = true;
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

    // Allow token from header
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

builder.Services.AddAuthentication()
.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
{
   options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
   options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
   options.CallbackPath = "/signin-google";

  // 🔥 THIS HANDLES CANCEL BUTTON
   options.Events.OnRemoteFailure = context =>
   {
     context.Response.Redirect(
      "https://localhost:5173/login?error=google_cancelled"
     );

     context.HandleResponse(); // 🚫 stops exception page
     return Task.CompletedTask;
   };
});


// ============================================================================
// 5. Email Service (FluentEmail)
builder.Services.AddFluentEmail(
        builder.Configuration["EmailSettings:SenderEmail"],
        builder.Configuration["EmailSettings:SenderName"])
    .AddSmtpSender(new SmtpClient(builder.Configuration["EmailSettings:SmtpServer"]!)
    {
        Port = int.Parse(builder.Configuration["EmailSettings:SmtpPort"]!),
        Credentials = new NetworkCredential(
            builder.Configuration["EmailSettings:SmtpUser"],
            builder.Configuration["EmailSettings:SmtpPass"]
        ),
        EnableSsl = true
    });

// ============================================================================
// 6. Custom Services
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<CurrentUserService>();
builder.Services.AddHttpContextAccessor();

// ============================================================================
// 7. Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ============================================================================
// 8. CORS
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

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "ServAd.ApiService", Version = "v1" });

    // Add JWT Support
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.\r\n\r\n" +
                      "Enter your token like this: Bearer {token}",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


// ============================================================================
// Build the App
var app = builder.Build();

// ============================================================================
// 9. Seed Roles & Admin User
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await RolesSeeder.SeedAsync(services);
    await UsersSeeder.SeedAdminAsync(services);
}

// ============================================================================
// 10. Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReact");

// Cookie policy required for Google OAuth
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
