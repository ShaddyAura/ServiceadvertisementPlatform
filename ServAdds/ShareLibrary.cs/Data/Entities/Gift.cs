using ShareLibrary.cs.Data.Enums;

using System.ComponentModel.DataAnnotations;

namespace ShareLibrary.cs.Data.Entities
{
    public class Gift
    {
        [Key]
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;       
        public string Description { get; set; } = string.Empty; 

        public decimal PointsRequired { get; set; }

        public GiftType Type { get; set; } = GiftType.Voucher;
        public string? ImageUrl { get; set; } 
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
