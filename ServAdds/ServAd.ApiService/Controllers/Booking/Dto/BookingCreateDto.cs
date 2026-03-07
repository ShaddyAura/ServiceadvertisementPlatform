using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Booking.Dto
{

    public record BookingCreateDto(
        [Required] Guid ServiceId,
        [Required] Guid ProfileId, // Matching the Entity "ProfileId"
        [Required] Guid ProviderProfileId,
        [Required] decimal AgreedPrice,
        [Required] DateTime ScheduledStart,
        [Required] DateTime ScheduledEnd,
        string? Notes
    );
}