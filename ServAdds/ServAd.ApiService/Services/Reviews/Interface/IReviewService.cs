using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Reviews.Interface
{
    public interface IReviewService
    {
        Task<bool> AddReviewAsync(Review review);
        Task<IEnumerable<Review>> GetReviewsByServiceIdAsync(Guid serviceId);
        Task<IEnumerable<Review>> GetAllReviewsAsync();
        Task<bool> DeleteReviewAsync(Guid reviewId);
    }
}