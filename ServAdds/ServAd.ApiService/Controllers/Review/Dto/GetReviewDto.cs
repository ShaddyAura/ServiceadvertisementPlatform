namespace ServAd.ApiService.Controllers.Review.Dto
{
    public class GetReviewDto
    {
        public Guid ReviewId { get; set; }
        public Guid ProfileId { get; set; }
        public Guid ServiceId { get; set; }

        public string FullName { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}
