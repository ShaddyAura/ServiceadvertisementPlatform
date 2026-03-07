namespace ShareLibrary.cs.Data.Entities
{
    public class Messages
    {
        // Matches your 'Bookings' model
        public record BookingNotification(
            Guid BookingId,
            Guid ProfileId,         // Customer
            Guid ProviderProfileId, // Provider
            string Status,
            decimal AgreedPrice
        );

        // Matches your 'ChatMessage' model
        public record ChatNotification(
            Guid MessageId,
            Guid BookingId,
            Guid SenderProfileId,
            Guid ReceiverProfileId,
            string MessageText
        );

        // Matches 'BoostingTransaction' & 'ServiceListings'
        public record BoostNotification(
            Guid ServiceId,
            string ServiceTitle,
            int PointsSpent,
            DateTime Expiry
        );

        // Matches 'RedeemedGift' & 'Gift'
        public record GiftNotification(
            Guid RedemptionId,
            Guid ProfileId,
            string GiftTitle,
            string VoucherCode
        );

        // Matches 'UserWallet'
        public record WalletNotification(
            Guid ProfileId,
            int NewPointsBalance,
            decimal NewCashBalance,
            string Type // "PointEarned", "PaymentReceived", etc.
        );
    }
}