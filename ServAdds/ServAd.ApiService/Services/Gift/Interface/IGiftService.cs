using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Gift.Interface
{
    public interface IGiftService
    {
        Task<IEnumerable<ShareLibrary.cs.Data.Entities.Gift>> GetActiveGiftsAsync();
        Task<RedeemedGift> RedeemVoucherAsync(Guid profileId, Guid giftId);
        Task<IEnumerable<RedeemedGift>> GetUserVouchersAsync(Guid profileId);
    }
}