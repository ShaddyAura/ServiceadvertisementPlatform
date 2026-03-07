namespace ServAd.ApiService.Controllers.Profile.Dto
{
    public class UpdateProfileDto
    {
        public Guid Id { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}