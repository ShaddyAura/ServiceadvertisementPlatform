using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.Review.Dto;
using ServAd.ApiService.Services.Reviews.Interface;


namespace ServAd.ApiService.Controllers.Review
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController(IReviewService reviewService) : ControllerBase
    {
        [HttpPost("Review")]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            var review = new ShareLibrary.cs.Data.Entities.Review
            {
                Id = Guid.NewGuid(),
                Rating = dto.Rating,
                Comment = dto.Comment,
                ProfileId = dto.ProfileId,
                ServiceId = dto.ServiceId,
                CreatedAt = DateTime.UtcNow
            };

            var success = await reviewService.AddReviewAsync(review);

            if (!success)
            {
                return BadRequest("Could not save the review.");
            }

            return Ok(new { Message = "Review submitted successfully!", ReviewId = review.Id });
        }

        [HttpGet("serviceReview")]
        public async Task<IActionResult> GetServiceReviews(Guid serviceId)
        {
            var reviews = await reviewService.GetReviewsByServiceIdAsync(serviceId);
            return Ok(reviews);
        }

        [HttpGet("all-reviews")]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await reviewService.GetAllReviewsAsync();
            return Ok(reviews);
        }

        [HttpDelete("delete/{reviewId}")]
        public async Task<IActionResult> DeleteReview(Guid reviewId)
        {
            var success = await reviewService.DeleteReviewAsync(reviewId);
            if (!success)
            {
                return NotFound(new { Message = "Review not found or could not be deleted." });
            }
            return Ok(new { Message = "Review deleted successfully." });
        }
    }
}