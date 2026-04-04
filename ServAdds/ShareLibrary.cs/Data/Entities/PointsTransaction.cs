using ShareLibrary.cs.Data.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShareLibrary.cs.Data.Entities
{
    public class PointsTransaction
    {
        [Key]
        public Guid Id { get; set; }
        public Guid WalletId { get; set; }

        [ForeignKey("WalletId")]
        public virtual UserWallet Wallet { get; set; } = null!;

        public decimal Amount { get; set; } 
        public PointsSource Source { get; set; }

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    }
}
