using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShareLibrary.cs.Data.Entities
{
    public class BoostingTransaction
    {
        [Key]
        public Guid Id { get; set; }
        public Guid ServiceId { get; set; }
        [ForeignKey("ServiceId")]
        public virtual ServiceListings Service { get; set; } = null!;

        public int PointsSpent { get; set; } = 10000;
        public DateTime BoostStartDate { get; set; } = DateTime.UtcNow;
        public DateTime BoostEndDate { get; set; }


    }
}
