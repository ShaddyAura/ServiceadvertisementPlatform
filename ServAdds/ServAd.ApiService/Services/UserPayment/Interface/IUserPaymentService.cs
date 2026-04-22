using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.UserPayment.Interface
{
    public interface IUserPaymentService
    {
        Task<IEnumerable<UserRewardHistory>> GetUserPaymentHistoryAsync(Guid profileId);
        Task<IEnumerable<BookingPayment>> GetProviderEarningsAsync(Guid profileId);
    }
}
