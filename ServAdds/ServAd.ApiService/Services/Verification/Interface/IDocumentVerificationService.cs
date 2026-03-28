using ShareLibrary.cs.Data.Enums;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Verification.Interface
{
    public interface IDocumentVerificationService
    {
        Task<DocumentVerified> SubmitDocumentAsync(DocumentVerified document);
        Task<DocumentVerified> UpdateDocumentAsync(DocumentVerified document);
        Task<DocumentVerified> ReviewDocumentAsync(Guid documentId, VerificationStatus status, string? Message);
        Task<IEnumerable<DocumentVerified>> GetUserDocumentsAsync(Guid profileId);
        Task<IEnumerable<DocumentVerified>> GetAllDocumentsAsync();
        Task<DocumentVerified?> GetByIdAsync(Guid id);
        Task DeleteDocumentAsync(Guid documentId);
    }
}
