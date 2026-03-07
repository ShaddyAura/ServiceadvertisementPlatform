using System.ComponentModel.DataAnnotations;
using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Controllers.Boosting.Dto
{
    public class BoostRequestDto
    {
        [Required]
        public Guid ServiceId { get; set; }

        [Required]
        public BoostLevel BoostLevel { get; set; }

        [Range(1, int.MaxValue)]
        public int PointsToSpend { get; set; }

        [Range(1, 365)]
        public int Days { get; set; }
    }
}