using ShareLibrary.cs.Data.Entities;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ShareLibrary.Data.Entities
{
    public class Review
    {
        public Guid Id { get; set; }
        public int Rating { get; set; } 
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        // Foreign Keys (Examples)
        // --- Link to Service ---
        public Guid ServiceId { get; set; }
        [ForeignKey("ServiceId")]
        public virtual ServiceListings Service { get; set; } = null!;

        // --- Link to Customer (The person booking) ---
        public Guid ProfileId { get; set; }
        [ForeignKey("ProfileId")]
        //[JsonIgnore]
        public virtual Profiles Profile { get; set; } = null!;
    }
}