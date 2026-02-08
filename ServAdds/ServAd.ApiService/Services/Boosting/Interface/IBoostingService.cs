using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Boosting.Interface
{
    public interface IBoostingService
    {
        Task<BoostingTransaction> BoostServiceAsync(Guid serviceId, int pointsToSpend, int days);
        Task<IEnumerable<BoostingTransaction>> GetServiceBoostHistoryAsync(Guid serviceId);
        Task<bool> IsServiceCurrentlyBoostedAsync(Guid serviceId);
    }
}
