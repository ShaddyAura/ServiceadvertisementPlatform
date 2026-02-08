using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.ServiceListing.Interface
{
    public interface IServiceListing
    {
        Task<IEnumerable<ServiceListings>> GetAllAsync();
        Task<ServiceListings?> GetByIdAsync(Guid id);
        // Modified to accept files directly
        Task<ServiceListings> CreateAsync(ServiceListings service, IFormFile? imageFile, IFormFile? videoFile);
        Task UpdateAsync(ServiceListings service, IFormFile? imageFile, IFormFile? videoFile);
        Task DeleteAsync(Guid id);
        Task AddViewPointsAsync(Guid profileId);

    }
}