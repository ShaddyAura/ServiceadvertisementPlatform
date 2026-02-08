using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Booking.Dto;

public record BookingCreateDto(
    [Required] Guid ServiceId,
    [Required] Guid CustomerProfileId,
    [Required] Guid ProviderProfileId,
    [Required] DateTime ScheduledAt
);