using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Services.UserPayment.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.UserPayment.Service
{
    public class UserPaymentService(ServiceDbContext context) : IUserPaymentService
    {
        public async Task<IEnumerable<UserRewardHistory>> GetUserPaymentHistoryAsync(Guid profileId)
        {
            return await context.UserRewardHistories
                .Include(r => r.Booking)
                    .ThenInclude(b => b.Service)
                .Where(r => r.ProfileId == profileId)
                .OrderByDescending(r => r.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
