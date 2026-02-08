using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShareLibrary.cs.Data.Enums
{
    public enum BookingStatus
    {
        Pending,    // Initial request from customer
        Confirmed,  // Provider accepted the booking
        InProcess,  // Service is currently being delivered
        Completed,  // Service finished and payment released
        Cancelled,  // Either party cancelled
        Disputed
    }
}
