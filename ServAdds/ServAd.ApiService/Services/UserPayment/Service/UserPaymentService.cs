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

        public async Task<IEnumerable<BookingPayment>> GetProviderEarningsAsync(Guid profileId)
        {
            return await context.BookingPayments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Service)
                .Where(p => p.ProviderProfileId == profileId)
                .OrderByDescending(p => p.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
