using ShareLibrary.cs.Data.Enums;
using ShareLibrary.Data.Entities;

namespace ServAd.ApiService.Services.Verification.Interface
{
    public interface IDocumentVerificationService
    {
        Task<DocumentVerified> SubmitDocumentAsync(DocumentVerified document);
        Task<IEnumerable<DocumentVerified>> GetUserDocumentsAsync(Guid profileId);
        Task<DocumentVerified> ReviewDocumentAsync(Guid documentId, VerificationStatus status, string? remarks, Guid adminId);
        Task<DocumentVerified?> GetByIdAsync(Guid id);
    }
}
