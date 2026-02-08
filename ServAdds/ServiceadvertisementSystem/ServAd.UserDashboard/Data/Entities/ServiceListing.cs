using StructureMap;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ServAd.UserDashboard.Data.Entities
{

    public class ServiceListing
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ProfileId { get; set; }

        [ForeignKey("ProfileId")]

        public virtual Profiles Profile { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }

        // Features for Boosting & Visibility
        public bool IsBoosted { get; set; } = false;
        public DateTime? BoostExpiry { get; set; }
    }
}