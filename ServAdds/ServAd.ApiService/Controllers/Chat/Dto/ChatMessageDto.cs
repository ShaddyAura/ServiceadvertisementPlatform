namespace ServAd.ApiService.Controllers.Chat.Dto
{
    public record ChatMessageDto(
        Guid BookingId,
        Guid SenderProfileId,
        Guid ReceiverProfileId, 
        string MessageText
    );
}