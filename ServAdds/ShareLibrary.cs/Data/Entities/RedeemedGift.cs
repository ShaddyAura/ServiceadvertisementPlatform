using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShareLibrary.cs.Data.Entities
{
    public class RedeemedGift
    {
        [Key]
        public Guid Id { get; set; }

        public Guid ProfileId { get; set; }
        public Guid GiftId { get; set; }

        [ForeignKey("GiftId")]
        public virtual Gift Gift { get; set; } = null!;

        // The random code shown to the merchant (e.g., "FOOD-X7Y2-2026")
        public string VoucherCode { get; set; } = string.Empty;

        // Merchant marks this as true when the user eats/uses it
        public bool IsUsed { get; set; } = false;
        public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;
    }
}
