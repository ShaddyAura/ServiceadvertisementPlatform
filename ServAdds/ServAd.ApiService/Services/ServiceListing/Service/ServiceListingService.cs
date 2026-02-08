using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ServAd.ApiService.Services.ServiceListing.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace ServAd.ApiService.Services.ServiceListing.Service
{
    public class ServiceListingService : IServiceListing
    {
        private readonly ServiceDbContext _context;
        private readonly IRabbitmqService _rabbitMQ;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<ServiceListingService> _logger;

        private const string UploadFolder = "uploads/services";

        public ServiceListingService(
            ServiceDbContext context,
            IRabbitmqService rabbitMQ,
            IWebHostEnvironment env,
            ILogger<ServiceListingService> logger)
        {
            _context = context;
            _rabbitMQ = rabbitMQ;
            _env = env;
            _logger = logger;
        }

        public async Task<IEnumerable<ServiceListings>> GetAllAsync()
        {
            return await _context.ServiceListings
                .Include(s => s.Profile)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<ServiceListings> GetByIdAsync(Guid id)
        {
            return await _context.ServiceListings
                .Include(s => s.Profile)
                .FirstOrDefaultAsync(s => s.Id == id)
                ?? throw new ApiException("Service not found", 404);
        }

          public async Task<ServiceListings> CreateAsync(
            ServiceListings service,
            IFormFile? imageFile,
             IFormFile? videoFile)
          {
            try
            {
                // --- ADD THIS VALIDATION ---
                // Verify that the ProfileId actually exists in the database
                var profileExists = await _context.Profiles.AnyAsync(p => p.Id == service.ProfileId);
                if (!profileExists)
                {
                    _logger.LogWarning("Create failed: ProfileId {ProfileId} not found.", service.ProfileId);
                    throw new ApiException($"The Profile ID '{service.ProfileId}' is invalid or does not exist.", 400);
                }

                // Ensure ID is generated
                if (service.Id == Guid.Empty)
                    service.Id = Guid.NewGuid();

                // 1. Validate Media Constraint
                if (imageFile != null && videoFile != null)
                    throw new ApiException("Upload either image OR video, not both", 400);

                // 2. Handle File Saving
                if (imageFile != null)
                {
                    service.ImageUrl = await SaveToDiskAsync(imageFile);
                    service.VideoUrl = null;
                }
                else if (videoFile != null)
                {
                    service.VideoUrl = await SaveToDiskAsync(videoFile);
                    service.ImageUrl = null;
                }

                // 3. Save to Database
                _context.ServiceListings.Add(service);
                await _context.SaveChangesAsync();

                // 4. RabbitMQ Notification
                await _rabbitMQ.PublishMessageAsync(
                    new { service.Id, service.Title, Action = "Created" },
                    "service_created_queue"
                );

                return service;
            }
            catch (ApiException) { throw; } // Let our custom API exceptions through
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database update failed during creation");
                // Provide a cleaner message for foreign key issues
                throw new ApiException("Database constraint violation. Ensure the Profile and Category exist.", 500);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Service create failed");
                throw new ApiException(ex.Message, 500);
            }
          }

        public async Task UpdateAsync(
            ServiceListings updated,
            IFormFile? imageFile,
            IFormFile? videoFile)
        {
            var existing = await _context.ServiceListings.FindAsync(updated.Id)
                ?? throw new ApiException("Service not found", 404);

            // Update Fields
            existing.Title = updated.Title;
            existing.Description = updated.Description;
            existing.Category = updated.Category;
            existing.Price = updated.Price;
            existing.StartTime = updated.StartTime;
            existing.EndTime = updated.EndTime;
            existing.Status = updated.Status;

            // Handle Media Updates
            if (imageFile != null && videoFile != null)
                throw new ApiException("Upload either image OR video", 400);

            if (imageFile != null)
            {
                DeleteOldFile(existing.ImageUrl);
                DeleteOldFile(existing.VideoUrl); // Remove video if switching to image
                existing.ImageUrl = await SaveToDiskAsync(imageFile);
                existing.VideoUrl = null;
            }
            else if (videoFile != null)
            {
                DeleteOldFile(existing.VideoUrl);
                DeleteOldFile(existing.ImageUrl); // Remove image if switching to video
                existing.VideoUrl = await SaveToDiskAsync(videoFile);
                existing.ImageUrl = null;
            }

            await _context.SaveChangesAsync();

            await _rabbitMQ.PublishMessageAsync(
                new { existing.Id, Action = "Updated" },
                "service_updates_queue"
            );
        }

        public async Task DeleteAsync(Guid id)
        {
            var service = await _context.ServiceListings.FindAsync(id)
                ?? throw new ApiException("Service not found", 404);

            // Clean up files before deleting record
            DeleteOldFile(service.ImageUrl);
            DeleteOldFile(service.VideoUrl);

            _context.ServiceListings.Remove(service);
            await _context.SaveChangesAsync();
        }

        // ---------------- HELPERS ----------------

        private async Task<string> SaveToDiskAsync(IFormFile file)
        {
            if (string.IsNullOrWhiteSpace(_env.WebRootPath))
                throw new ApiException("wwwroot folder not found. Ensure app.UseStaticFiles() is in Program.cs", 500);

            var folderPath = Path.Combine(_env.WebRootPath, UploadFolder);
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

        private void DeleteOldFile(string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath) || string.IsNullOrWhiteSpace(_env.WebRootPath)) return;

            var fullPath = Path.Combine(_env.WebRootPath, relativePath.TrimStart('/'));

            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }

        public async Task AddViewPointsAsync(Guid profileId)
        {
            // Placeholder for boosting logic
            await Task.CompletedTask;
        }
    }
}