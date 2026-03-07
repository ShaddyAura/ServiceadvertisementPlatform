namespace ServAd.ApiService.Controllers.Notification.Dto
{
    public record NotificationResponseDto(
        Guid Id,
        string Title,
        string Message,
        string? ActionUrl,
        bool IsRead,
        DateTime CreatedAt
    );

    public record CreateManualNotificationDto(
        Guid ProfileId,
        string Title,
        string Message,
        string? ActionUrl
    );
}