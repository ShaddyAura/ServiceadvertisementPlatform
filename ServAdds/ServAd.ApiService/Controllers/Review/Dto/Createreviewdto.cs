using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Controllers.Review.Dto
{
    public class CreateReviewDto
    {
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }

        [Required]
        [StringLength(500, ErrorMessage = "Comment cannot exceed 500 characters.")]
        public string Comment { get; set; } = string.Empty;

        [Required]
        public Guid ProfileId { get; set; }

        [Required]
        public Guid ServiceId { get; set; }
    }
}