namespace ServAd.ApiService.Controllers.Gifts.Dto
{
    public record GiftResponseDto(
        Guid Id,
        string Title,
        string Description,
        int PointsRequired,
        string? ImageUrl);
}