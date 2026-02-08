

using global::ServAd.ApiService.Services.Verification.Interface;
using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;
using ShareLibrary.Data.Entities;

namespace ServAd.ApiService.Services.Verification.Service
    {

        public class DocumentVerificationService(
            ServiceDbContext context,
            IRabbitmqService rabbitMQ,
            ILogger<DocumentVerificationService> logger) : IDocumentVerificationService
        {
            public async Task<DocumentVerified> SubmitDocumentAsync(DocumentVerified document)
            {
                try
                {
                    document.Id = Guid.NewGuid();
                    document.Status = VerificationStatus.Pending;
                    document.SubmittedAt = DateTime.UtcNow;

                    context.DocumentVerifieds.Add(document);
                    await context.SaveChangesAsync();

                    // 🚀 Notify RabbitMQ for Admin Review queue
                    await rabbitMQ.PublishMessageAsync(new
                    {
                        DocumentId = document.Id,
                        document.ProfileId,
                        Type = document.DocumentType.ToString(),
                        Action = "NewSubmission"
                    }, "admin_verification_queue");

                    return document;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to submit document for Profile {Id}", document.ProfileId);
                    throw new ApiException("Error saving verification document.", 500);
                }
            }

            public async Task<DocumentVerified> ReviewDocumentAsync(Guid documentId, VerificationStatus status, string? remarks, Guid adminId)
            {
                var doc = await context.DocumentVerifieds
                    .Include(d => d.Profile)
                    .FirstOrDefaultAsync(d => d.Id == documentId)
                    ?? throw new ApiException("Document not found.", 404);

                doc.Status = status;
                doc.AdminRemarks = remarks;
                doc.VerifiedByAdminId = adminId;
                doc.VerifiedAt = DateTime.UtcNow;

                // If approved, we could also update the Profile.IsVerified flag here
                if (status == VerificationStatus.Approved)
                {
                    // Logic to mark the actual user profile as verified
                }

                await context.SaveChangesAsync();

                // 🚀 Notify RabbitMQ that status has changed (to notify the user)
                await rabbitMQ.PublishMessageAsync(new
                {
                    doc.ProfileId,
                    doc.Id,
                    NewStatus = status.ToString(),
                    Remarks = remarks
                }, "user_notification_queue");

                return doc;
            }

            public async Task<IEnumerable<DocumentVerified>> GetUserDocumentsAsync(Guid profileId) =>
                await context.DocumentVerifieds
                    .Where(d => d.ProfileId == profileId)
                    .OrderByDescending(d => d.SubmittedAt)
                    .ToListAsync();

            public async Task<DocumentVerified?> GetByIdAsync(Guid id) =>
                await context.DocumentVerifieds.FindAsync(id);
        }
    }

