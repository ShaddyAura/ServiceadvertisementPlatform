using ServAd.ApiService.Data.Enums;
using ServAd.UserDashboard.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServAd.UserDashboard.Application
{
    public interface IVerificationDocumentService
    {
        // -----------------------------
        // User Actions
        // -----------------------------

        /// <summary>
        /// Upload identity verification document
        /// </summary>
        Task<Guid> UploadDocumentAsync(
            Guid userId,
            DocumentType documentType,
            string documentNumber,
            string documentUrl,
            DateTime? expiryDate
        );

        /// <summary>
        /// Get current verification status of a user
        /// </summary>
        Task<VerificationDocument?> GetUserVerificationAsync(Guid userId);

        /// <summary>
        /// Check if user is verified (used for booking/payment)
        /// </summary>
        Task<bool> IsUserVerifiedAsync(Guid userId);

        // -----------------------------
        // Admin Actions
        // -----------------------------

        /// <summary>
        /// Approve a verification document
        /// </summary>
        Task ApproveDocumentAsync(
            Guid verificationDocumentId,
            Guid adminId
        );

        /// <summary>
        /// Reject a verification document with reason
        /// </summary>
        Task RejectDocumentAsync(
            Guid verificationDocumentId,
            Guid adminId,
            string rejectionReason
        );

        // -----------------------------
        // Dashboard / Admin Views
        // -----------------------------

        /// <summary>
        /// Get all pending verification requests
        /// </summary>
        Task<IEnumerable<VerificationDocument>> GetPendingVerificationsAsync();
    }
}
