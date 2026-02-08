namespace ServAd.ApiService.Controllers.Chat.Dto
{
    public record ChatMessageDto(Guid BookingId, Guid SenderProfileId, string MessageText);
}
