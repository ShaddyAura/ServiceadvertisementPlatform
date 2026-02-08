using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShareLibrary.cs.Data.Enums
{
    public enum VerificationStatus
    {
        NotSubmitted,
        Pending,    
        Verified,   // Approved; "Trust Badge" active
        Rejected,   // Admin declined (bad photo, expired ID)
        Suspended,
        Approved// User banned by moderator
    }
}
