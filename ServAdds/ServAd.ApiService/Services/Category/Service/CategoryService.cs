using Microsoft.EntityFrameworkCore;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using ServAd.ApiService.Services.Category.Interface;
using ServAd.ApiService.Exceptions;

namespace ServAd.ApiService.Services.Category.Service
{
    public class CategoryService(ServiceDbContext context) : ICategoryService
    {
        public async Task<IEnumerable<ServiceCategory>> GetAllActiveAsync()
        {
            return await context.ServiceCategories
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<ServiceCategory?> GetByIdAsync(int id)
        {
            return await context.ServiceCategories.FindAsync(id)
                ?? throw new ApiException("Category not found", 404);
        }

        public async Task<ServiceCategory> CreateAsync(ServiceCategory category)
        {
            context.ServiceCategories.Add(category);
            await context.SaveChangesAsync();
            return category;
        }

        public async Task UpdateAsync(ServiceCategory category)
        {
            context.ServiceCategories.Update(category);
            await context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var category = await GetByIdAsync(id);
            if (category != null)
            {
                // Soft delete or hard delete based on preference
                category.IsActive = false;
                await context.SaveChangesAsync();
            }
        }
    }
}