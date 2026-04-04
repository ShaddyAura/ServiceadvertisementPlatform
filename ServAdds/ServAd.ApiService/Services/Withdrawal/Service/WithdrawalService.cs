using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Notifications.Interface;
using ServAd.ApiService.Services.Withdrawal.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Withdrawal.Service
{
    public class WithdrawalService(
        ServiceDbContext context,
        INotificationService notification,
        ILogger<WithdrawalService> logger) : IWithdrawalService
    {
        public async Task<WithdrawalRequest> CreateRequestAsync(Guid profileId, decimal amount, string method, string details)
        {
            var wallet = await context.Wallets.FirstOrDefaultAsync(w => w.ProfileId == profileId)
                ?? throw new ApiException("Wallet not found.", 404);

            decimal currentBalance = method.ToLower() == "esewa" ? wallet.ESewaBalance : wallet.KhaltiBalance;
            
            if (currentBalance < amount)
                throw new ApiException("Insufficient balance.", 400);

            var request = new WithdrawalRequest
            {
                Id = Guid.NewGuid(),
                ProfileId = profileId,
                Amount = amount,
                PaymentMethod = method,
                AccountDetails = details,
                Status = "Pending",
                RequestedAt = DateTime.UtcNow
            };

            context.WithdrawalRequests.Add(request);
            await context.SaveChangesAsync();

            return request;
        }

        public async Task<IEnumerable<WithdrawalRequest>> GetAllRequestsAsync()
        {
            return await context.WithdrawalRequests
                .Include(w => w.Profile)
                .OrderByDescending(w => w.RequestedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<WithdrawalRequest>> GetRequestsByProfileIdAsync(Guid profileId)
        {
            return await context.WithdrawalRequests
                .Where(w => w.ProfileId == profileId)
                .OrderByDescending(w => w.RequestedAt)
                .ToListAsync();
        }

        public async Task<bool> ApproveRequestAsync(Guid requestId)
        {
            var request = await context.WithdrawalRequests.FindAsync(requestId)
                ?? throw new ApiException("Request not found.", 404);

            if (request.Status != "Pending")
                throw new ApiException("Request has already been processed.", 400);

            var wallet = await context.Wallets.FirstOrDefaultAsync(w => w.ProfileId == request.ProfileId);
            if (wallet == null) throw new ApiException("Wallet not found.", 404);

            // Deduct from wallet
            if (request.PaymentMethod.ToLower() == "esewa")
            {
                if (wallet.ESewaBalance < request.Amount) throw new ApiException("Insufficient wallet balance for transfer.", 400);
                wallet.ESewaBalance -= request.Amount;
            }
            else
            {
                if (wallet.KhaltiBalance < request.Amount) throw new ApiException("Insufficient wallet balance for transfer.", 400);
                wallet.KhaltiBalance -= request.Amount;
            }

            request.Status = "Approved";
            request.ProcessedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            // Notify user
            await notification.NotifyPointWalletUpdate(request.ProfileId, 0, -request.Amount, $"Withdrawal Approved via {request.PaymentMethod}");

            return true;
        }

        public async Task<bool> RejectRequestAsync(Guid requestId)
        {
            var request = await context.WithdrawalRequests.FindAsync(requestId)
                ?? throw new ApiException("Request not found.", 404);

            if (request.Status != "Pending")
                throw new ApiException("Request has already been processed.", 400);

            request.Status = "Rejected";
            request.ProcessedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            // Notify user
            await notification.NotifyPointWalletUpdate(request.ProfileId, 0, 0, $"Withdrawal Rejected - {request.PaymentMethod}");

            return true;
        }
    }
}
