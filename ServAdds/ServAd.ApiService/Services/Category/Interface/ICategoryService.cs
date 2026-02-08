using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Category.Interface
{
    public interface ICategoryService
    {
        Task<IEnumerable<ServiceCategory>> GetAllActiveAsync();
        Task<ServiceCategory?> GetByIdAsync(int id);
        // Added for admin management
        Task<ServiceCategory> CreateAsync(ServiceCategory category);
        Task UpdateAsync(ServiceCategory category);
        Task DeleteAsync(int id);
    }
}
