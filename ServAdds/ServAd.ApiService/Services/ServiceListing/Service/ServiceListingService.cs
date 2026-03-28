using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ServAd.ApiService.Services.ServiceListing.Interface;
using ServAd.ApiService.Services.Notifications.Interface;
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
        private readonly INotificationService _notification;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<ServiceListingService> _logger;

        private const string UploadFolder = "uploads/services";

        public ServiceListingService(
            ServiceDbContext context,
            IRabbitmqService rabbitMQ,
            INotificationService notification,
            IWebHostEnvironment env,
            ILogger<ServiceListingService> logger)
        {
            _context = context;
            _rabbitMQ = rabbitMQ;
            _notification = notification;
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

        public async Task<ServiceListings?> GetByIdAsync(Guid id)
        {
            return await _context.ServiceListings
                .Include(s => s.Profile)
                .FirstOrDefaultAsync(s => s.Id == id)
                ?? throw new ApiException("Service not found", 404);
        }

        public async Task<ServiceListings> CreateAsync(ServiceListings service, IFormFile? imageFile, IFormFile? videoFile)
        {
            try
            {
                var profileExists = await _context.Profiles.AnyAsync(p => p.Id == service.ProfileId);
                if (!profileExists) throw new ApiException($"Profile {service.ProfileId} not found.", 400);

                if (service.Id == Guid.Empty) service.Id = Guid.NewGuid();

                // Media logic
                if (imageFile != null && videoFile != null) throw new ApiException("Upload either image OR video", 400);
                if (imageFile != null) service.ImageUrl = await SaveToDiskAsync(imageFile);
                else if (videoFile != null) service.VideoUrl = await SaveToDiskAsync(videoFile);

                _context.ServiceListings.Add(service);
                await _context.SaveChangesAsync();

                // 🔥 Trigger Notification & RabbitMQ
                await _notification.NotifyServiceAdded(service.ProfileId, service.Title);
                await _rabbitMQ.PublishMessageAsync(new { service.Id, service.Title, Action = "Created" }, "service_created_queue");

                return service;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Service creation failed");
                throw;
            }
        }

        public async Task UpdateAsync(ServiceListings updated, IFormFile? imageFile, IFormFile? videoFile)
        {
            var existing = await _context.ServiceListings.FindAsync(updated.Id) ?? throw new ApiException("Not found", 404);

            existing.Title = updated.Title;
            existing.Description = updated.Description;
            existing.Price = updated.Price;
            existing.Status = updated.Status;

            if (imageFile != null)
            {
                DeleteOldFile(existing.ImageUrl);
                existing.ImageUrl = await SaveToDiskAsync(imageFile);
                existing.VideoUrl = null;
            }
            else if (videoFile != null)
            {
                DeleteOldFile(existing.VideoUrl);
                existing.VideoUrl = await SaveToDiskAsync(videoFile);
                existing.ImageUrl = null;
            }

            await _context.SaveChangesAsync();
            await _rabbitMQ.PublishMessageAsync(new { existing.Id, Action = "Updated" }, "service_updates_queue");
        }

        public async Task DeleteAsync(Guid id)
        {
            var service = await _context.ServiceListings.FindAsync(id) ?? throw new ApiException("Not found", 404);
            DeleteOldFile(service.ImageUrl);
            DeleteOldFile(service.VideoUrl);
            _context.ServiceListings.Remove(service);
            await _context.SaveChangesAsync();
        }

        private async Task<string> SaveToDiskAsync(IFormFile file)
        {
            // Define folder inside wwwroot
            var uploadFolder = Path.Combine(_env.WebRootPath, "uploads/services");
            if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative path used by the frontend
            return $"/uploads/services/{fileName}";
        }

        private void DeleteOldFile(string? path)
        {
            if (string.IsNullOrEmpty(path)) return;
            var fullPath = Path.Combine(_env.WebRootPath, path.TrimStart('/'));
            if (File.Exists(fullPath)) File.Delete(fullPath);
        }
         public async Task<IEnumerable<ServiceListings>> GetByProfileIdAsync(Guid profileId)
         {
           return await _context.ServiceListings
          .Where(s => s.ProfileId == profileId)
          .Include(s => s.Profile)
          .AsNoTracking()
          .ToListAsync();
         }

        public async Task AddViewPointsAsync(Guid profileId) => await Task.CompletedTask;
    }
}