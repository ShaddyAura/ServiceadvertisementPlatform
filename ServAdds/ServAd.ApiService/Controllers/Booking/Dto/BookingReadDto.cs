namespace ServAd.ApiService.Controllers.Booking.Dto;

public record BookingReadDto(
	Guid Id,
	Guid ServiceId,
	string ServiceName,
	Guid CustomerProfileId,
	Guid ProviderProfileId,
	string Status,
	DateTime ScheduledAt
);