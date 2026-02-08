using ShareLibrary.cs.Data.Entities;
using ShareLibrary.Data.Entities;

namespace ServAd.ApiService.Services.Admin_Features.Interface
{
    public interface IAdminService
    {
        // Document & Profile Verification
        Task<IEnumerable<Profiles>> GetPendingVerificationsAsync();
        Task VerifyUserDocumentAsync(Guid profileId);

        // Oversight
        Task<IEnumerable<Bookings>> GetGlobalBookingsAsync();
        Task<IEnumerable<UserWallet>> GetFinancialOverviewAsync();
        Task<IEnumerable<BoostingTransaction>> GetBoostingHistoryAsync();

        // Dashboard Stats
        Task<object> GetAdminStatsAsync();
    }
}