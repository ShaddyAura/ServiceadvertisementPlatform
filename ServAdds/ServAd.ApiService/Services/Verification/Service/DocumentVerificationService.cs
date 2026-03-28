using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ServAd.ApiService.Services.Verification.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Services.Verification.Service
{
    public class DocumentVerificationService(
        ServiceDbContext context,
        IRabbitmqService rabbitMQ,
        ILogger<DocumentVerificationService> logger)
        : IDocumentVerificationService
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

        public async Task<DocumentVerified> ReviewDocumentAsync(Guid documentId, VerificationStatus status, string? Message)
        {
            var strategy = context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await context.Database.BeginTransactionAsync();
                try
                {
                    // 1. Fetch document and include Profile for the verification toggle
                    var doc = await context.DocumentVerifieds
                        .Include(d => d.Profile)
                        .FirstOrDefaultAsync(d => d.Id == documentId)
                        ?? throw new ApiException("Document not found.", 404);

                    if (doc.Status == VerificationStatus.Approved)
                        throw new ApiException("Document has already been approved.", 400);

                    // 2. Update Document Status
                    doc.Status = status;
                    doc.Message = Message;
                    doc.VerifiedAt = DateTime.UtcNow;

                    // 3. Update Profile Status if Approved
                    if (status == VerificationStatus.Approved && doc.Profile != null)
                    {
                        doc.Profile.IsVerified = true;
                    }

                    await context.SaveChangesAsync();

                    // 4. Notify User (RabbitMQ) - Wrapped to prevent rolling back DB on MQ failure
                    try
                    {
                        await rabbitMQ.PublishMessageAsync(new
                        {
                            doc.ProfileId,
                            DocumentId = doc.Id,
                            NewStatus = status.ToString(),
                            AdminNote = Message,
                            Timestamp = DateTime.UtcNow
                        }, "user_notification_queue");
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "RabbitMQ failed for document {Id}, but DB update succeeded.", documentId);
                    }

                    await transaction.CommitAsync();
                    return doc;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();

                    // Re-throw if it's already a known ApiException
                    if (ex is ApiException) throw;

                    // Log generic errors and wrap in a clean 500 error
                    logger.LogError(ex, "Error reviewing document {Id}", documentId);
                    throw new ApiException($"Internal Processing Error: {ex.Message}", 500);
                }
            });
        }

        public async Task<IEnumerable<DocumentVerified>> GetAllDocumentsAsync()
        {
            return await context.DocumentVerifieds
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<DocumentVerified> UpdateDocumentAsync(DocumentVerified document)
        {
            try
            {
                var existing = await context.DocumentVerifieds
                    .FirstOrDefaultAsync(d => d.Id == document.Id);

                if (existing == null)
                    throw new KeyNotFoundException("Document not found");

                if (existing.Status == VerificationStatus.Approved)
                    throw new InvalidOperationException("Approved documents cannot be updated.");

                existing.DocumentFrontSideUrl = document.DocumentFrontSideUrl;
                existing.DocumentBackSideUrl = document.DocumentBackSideUrl;
                existing.DocumentType = document.DocumentType;
                existing.DocumentNumber = document.DocumentNumber;

                existing.Status = VerificationStatus.Pending;
                existing.SubmittedAt = DateTime.UtcNow;

                await context.SaveChangesAsync();

                return existing;
            }
            catch
            {
                // Let controller handle it
                throw;
            }
        }

        public async Task<IEnumerable<DocumentVerified>> GetUserDocumentsAsync(Guid profileId)
        {
            return await context.DocumentVerifieds
                .AsNoTracking()
                .Where(d => d.ProfileId == profileId)
                .OrderByDescending(d => d.SubmittedAt)
                .ToListAsync();
        }

        public async Task<DocumentVerified?> GetByIdAsync(Guid id)
        {
            return await context.DocumentVerifieds
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task DeleteDocumentAsync(Guid documentId)
        {
            try
            {
                var document = await context.DocumentVerifieds.FindAsync(documentId);

                if (document == null)
                {
                    throw new ApiException("Document not found.", 404);
                }

                if (document.Status == VerificationStatus.Approved)
                {
                    throw new ApiException("Approved documents cannot be deleted.", 400);
                }

                context.DocumentVerifieds.Remove(document);
                await context.SaveChangesAsync();

                logger.LogInformation("Document {DocumentId} deleted successfully.", documentId);
            }
            catch (ApiException)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error deleting document {DocumentId}", documentId);
                throw new ApiException("An error occurred while deleting the document.", 500);
            }
        }
    }
}