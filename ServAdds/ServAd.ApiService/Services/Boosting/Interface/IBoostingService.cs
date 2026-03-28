using ServAd.ApiService.Controllers.Boosting.Dto;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Services.Boosting.Interface
{
    public interface IBoostingService
    {
        Task<BoostingTransaction> BoostServiceAsync(
            Guid serviceId,
            BoostLevel level,
            decimal pointsToSpend,
            int days);

        Task<IEnumerable<BoostingTransaction>>
            GetServiceBoostHistoryAsync(Guid serviceId);

        Task<bool> IsServiceCurrentlyBoostedAsync(Guid serviceId);

        Task<BoostLevel> GetCurrentBoostLevelAsync(Guid serviceId);

        Task<BoostingTransaction?> GetServiceBoostInfoAsync(Guid serviceId);

        Task CancelBoostAsync(Guid serviceId);
    }
}