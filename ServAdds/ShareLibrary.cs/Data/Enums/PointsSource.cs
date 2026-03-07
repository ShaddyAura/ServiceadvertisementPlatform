using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShareLibrary.cs.Data.Enums
{
    public enum PointsSource
    {
        AdWatch,        // Free points
        DailyStrike,    // Free points (10/day)
        Purchase,       // Paid points (Increments Gift Target)
        BoostSpend      // Deduction when user promotes a service
    }
}
