using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Withdrawal.Interface
{
    public interface IWithdrawalService
    {
        Task<WithdrawalRequest> CreateRequestAsync(Guid profileId, decimal amount, string method, string details);
        Task<IEnumerable<WithdrawalRequest>> GetAllRequestsAsync();
        Task<IEnumerable<WithdrawalRequest>> GetRequestsByProfileIdAsync(Guid profileId);
        Task<bool> ApproveRequestAsync(Guid requestId);
        Task<bool> RejectRequestAsync(Guid requestId);
    }
}
