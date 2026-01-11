using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServAd.UserDashboard.Entities
{
    public class Service
    {
        public Guid ServiceId { get; set; }

        public Guid ProviderId { get; set; }

        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }

        public Guid CategoryId { get; set; }
        public double Rating { get; set; }
    }
}

