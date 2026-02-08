using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Services.Admin_Features.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.Data.Entities;

namespace ServAd.ApiService.Services.Admin_Features.Service
{
    public class AdminService(ServiceDbContext context) : IAdminService
    {
        // Admin handles verification based on the 'IsVerified' bool in your Profiles model
        public async Task VerifyUserDocumentAsync(Guid profileId)
        {
            var profile = await context.Profiles.FindAsync(profileId);
            if (profile != null)
            {
                profile.IsVerified = true;
                profile.UpdatedAt = DateTime.UtcNow;
                await context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Profiles>> GetPendingVerificationsAsync() =>
            await context.Profiles
                .Where(p => !p.IsVerified)
                .Include(p => p.VerifiedDocuments)
                .ToListAsync();

        public async Task<IEnumerable<UserWallet>> GetFinancialOverviewAsync() =>
            await context.Wallets.Include(w => w.Profile).ToListAsync();

        public async Task<IEnumerable<Bookings>> GetGlobalBookingsAsync() =>
            await context.Bookings
                .Include(b => b.Service)
                .AsNoTracking()
                .ToListAsync();

        public async Task<IEnumerable<BoostingTransaction>> GetBoostingHistoryAsync() =>
            await context.BoostingTransactions
                .Include(t => t.Service)
                .OrderByDescending(t => t.BoostStartDate)
                .ToListAsync();

        public async Task<object> GetAdminStatsAsync()
        {
            return new
            {
                PlatformESewaBalance = await context.Wallets.SumAsync(w => w.eSewaBalance),
                PlatformKhaltiBalance = await context.Wallets.SumAsync(w => w.KhaltiBalance),
                TotalServicesBoosted = await context.ServiceListings.CountAsync(s => s.IsBoosted),
                TotalVerifiedProviders = await context.Profiles.CountAsync(p => p.IsVerified)
            };
        }
    }
}