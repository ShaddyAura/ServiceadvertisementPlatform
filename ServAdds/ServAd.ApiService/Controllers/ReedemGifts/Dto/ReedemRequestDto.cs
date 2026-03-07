namespace ServAd.ApiService.Controllers.ReedemGifts.Dto
{
    public record ReedemRequestDto(Guid ProfileId, Guid GiftId);

    public record VoucherResponseDto(
        string GiftTitle,
        string VoucherCode,
        DateTime RedeemedAt,
        bool IsUsed);
}