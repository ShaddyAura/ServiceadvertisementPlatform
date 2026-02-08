using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Profile.Interface;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.Data.Entities;

namespace ServAd.ApiService.Services.Profile.Service
{
    public class ProfileService(
        ServiceDbContext context,
        IRabbitmqService rabbitMQ,
        IWebHostEnvironment env, 
        ILogger<ProfileService> logger) : IProfileService
    {
        private const string UploadFolder = "Profiles";

        // GET profile by User ID (Includes Wallet)
        public async Task<Profiles> GetByUserIdAsync(Guid userId) =>
            await context.Profiles
                .Include(p => p.Wallet)
                .FirstOrDefaultAsync(p => p.UserId == userId)
                ?? throw new ApiException("Profile not found.", 404);

        // GET profile by Profile ID
        public async Task<Profiles> GetByIdAsync(Guid id) =>
            await context.Profiles.FindAsync(id)
            ?? throw new ApiException("Profile not found.", 404);

        // UPLOAD & UPDATE Profile Image
        public async Task<string> UploadProfileImageAsync(Guid profileId, IFormFile file)
        {
            var profile = await GetByIdAsync(profileId);

            // Save file to wwwroot/Profiles
            var relativePath = await SaveToDiskAsync(file);

            // Update database field
            profile.ProfileImageUrl = relativePath;
            profile.UpdatedAt = DateTime.UtcNow;

            context.Profiles.Update(profile);
            await context.SaveChangesAsync();

            // Notify RabbitMQ about the image change
            await rabbitMQ.PublishMessageAsync(new
            {
                profile.Id,
                Action = "ImageUpdated",
                ImageUrl = relativePath,
                Timestamp = profile.UpdatedAt
            }, "profile_updates_queue");

            return relativePath;
        }

        // UPDATE profile details
        public async Task<Profiles> UpdateProfileAsync(Profiles profile)
        {
            profile.UpdatedAt = DateTime.UtcNow;
            context.Profiles.Update(profile);
            await context.SaveChangesAsync();

            await rabbitMQ.PublishMessageAsync(new
            {
                profile.Id,
                Action = "Updated",
                Timestamp = profile.UpdatedAt
            }, "profile_updates_queue");

            return profile;
        }

        // VERIFY profile
        public async Task<bool> MarkAsVerifiedAsync(Guid profileId)
        {
            var profile = await GetByIdAsync(profileId);
            profile.IsVerified = true;
            profile.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            await rabbitMQ.PublishMessageAsync(new
            {
                profile.Id,
                Status = "Verified",
                Timestamp = DateTime.UtcNow
            }, "profile_verification_queue");

            return true;
        }

        // Private Helper for Disk Storage
        private async Task<string> SaveToDiskAsync(IFormFile file)
        {
            if (string.IsNullOrWhiteSpace(env.WebRootPath))
                throw new ApiException("wwwroot folder not found. Ensure app.UseStaticFiles() is in Program.cs", 500);

            var folderPath = Path.Combine(env.WebRootPath, UploadFolder);
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/{UploadFolder}/{fileName}";
        }
    }
}