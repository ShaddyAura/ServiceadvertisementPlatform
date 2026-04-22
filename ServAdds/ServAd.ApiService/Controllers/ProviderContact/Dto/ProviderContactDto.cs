namespace ServAd.ApiService.Controllers.ProviderContact.Dto
{
    public class ProviderContactDto
    {
        public Guid ProfileId { get; set; }
        public string ProviderName { get; set; } = string.Empty;
        public string MobileNo { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? OperatingHours { get; set; }
    }
}
