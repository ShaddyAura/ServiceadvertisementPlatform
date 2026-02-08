using System.ComponentModel.DataAnnotations;

namespace ShareLibrary.cs.Data.Entities
{
    public class ServiceCategory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        // Optional: Add an icon class for the frontend (e.g., Bootstrap icons)
        public string? IconClass { get; set; }

        public bool IsActive { get; set; } = true;
    }
}