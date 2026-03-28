using Microsoft.EntityFrameworkCore;

using ServAd.ApiService.Services.Reviews.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Reviews.Service
{
    public class ReviewService(
        ServiceDbContext context,
        ILogger<ReviewService> logger) : IReviewService
    {
        public async Task<bool> AddReviewAsync(Review review)
        {
            try
            {
                review.CreatedAt = DateTime.UtcNow;
                context.Reviews.Add(review);

                var result = await context.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while saving review for Service {ServiceId}", review.ServiceId);
                return false;
            }
        }

        public async Task<IEnumerable<Review>> GetReviewsByServiceIdAsync(Guid serviceId)
        {
            return await context.Reviews
                .Include(r => r.Profile)
                .Where(r => r.ServiceId == serviceId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}