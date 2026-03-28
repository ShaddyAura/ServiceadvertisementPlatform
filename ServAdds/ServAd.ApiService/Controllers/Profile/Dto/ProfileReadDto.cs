using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Controllers.Profile.Dto
{
    public class ProfileReadDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; } = DateTime.Now;
        public string? ProfileImageUrl { get; set; }
        public bool IsVerified { get; set; }
        public decimal BoostingPoints { get; set; }
        public decimal LifetimePoints { get; set; }
        public DateTime CreatedAt { get; set; }

        // 🔥 ADD THIS
        public List<DocumentVerified>? VerificationDocuments { get; set; }
    }
}