using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.RedeemGift.Interface
{
    public interface IRedeemGiftService
    {
        // Generate a new voucher if target is met
        Task<RedeemedGift> ClaimGiftVoucherAsync(Guid profileId, Guid giftId);

        // Fetch user's active/used vouchers
        Task<IEnumerable<RedeemedGift>> GetMyVouchersAsync(Guid profileId);

        // Admin/Merchant side: Mark voucher as used at the restaurant
        Task<bool> MarkVoucherAsUsedAsync(Guid redeemedGiftId);

        // Get details of a specific voucher for verification
        Task<RedeemedGift?> GetVoucherDetailsAsync(string voucherCode);
    }
}