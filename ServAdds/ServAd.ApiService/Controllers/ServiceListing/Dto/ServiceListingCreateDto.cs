using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ShareLibrary.cs.Data.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ServAd.ApiService.Controllers.ServiceListing.Dto
{
    public class ServiceListingCreateDto
    {
        public Guid ProfileId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }

        // Change from TimeSpan to string for clean API input
        public string StartTime { get; set; } = "00:00:00";
        public string EndTime { get; set; } = "00:00:00";
        public ServiceStatus Status { get; set; }

        // Media Files
        public IFormFile? ImageFile { get; set; }
        public IFormFile? VideoFile { get; set; }
    }
}