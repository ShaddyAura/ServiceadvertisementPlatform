namespace ServAd.ApiService.Controllers.Booking.Dto;

public record BookingReadDto(
    Guid Id,
    Guid ServiceId,
    string ServiceName,
    Guid ProfileId, // Changed from CustomerProfileId to match Entity
    Guid ProviderProfileId,
    decimal AgreedPrice,
    string Status,
    DateTime ScheduledStart,
    DateTime ScheduledEnd
);