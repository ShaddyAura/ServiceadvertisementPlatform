using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShareLibrary.cs.Data.Entities
{
    public class Messages
    {
        public record BookingNotification(Guid BookingId, string CustomerEmail, string ProviderEmail, string Status);

        // --- Financial & Wallet Messages ---
        public record PaymentProcessedMessage(Guid ProfileId, decimal Amount, string Gateway, string TransactionId);
        public record WalletBalanceUpdateMessage(Guid ProfileId, decimal NewBalance, string CurrencyType);

        // --- Boosting & Marketing Messages ---
        public record BoostingActivatedMessage(Guid ServiceId, DateTime ExpiryDate, int PointsSpent);

        // --- System & Security Messages ---
        public record EmailVerificationMessage(Guid UserId, string Email, string Token);
        public record UserLockoutMessage(Guid UserId, string Email, DateTime LockoutEnd);
    }
}

