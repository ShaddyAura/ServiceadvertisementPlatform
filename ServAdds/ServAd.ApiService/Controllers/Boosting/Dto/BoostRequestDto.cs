using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Boosting.Dto
{ 
 public record BoostRequestDto(
    [Required] Guid ServiceId,
    [Required, Range(1, 1000)] int PointsToSpend,
    [Required, Range(1, 30)] int Days
 );
}