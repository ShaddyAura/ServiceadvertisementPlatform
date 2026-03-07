using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ServAd.ApiService.Controllers.Verification.Dto;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Verification.Interface;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.Data.Entities;

namespace ServAd.ApiService.Controllers.Verification
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentVerificationController(
        IDocumentVerificationService verificationService,
        IWebHostEnvironment env) : ControllerBase
    {
        [HttpPost("submitdocuments")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Submit([FromForm] DocumentSubmitDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 1. Validation: Ensure both sides are provided
            if (dto.DocumentFrontSide == null || dto.DocumentBackSide == null)
            {
                return BadRequest("Both Front and Back sides of the document are required.");
            }

            // 2. Save Both Files to Protected Folder
            string frontPath = await SaveSecureFileAsync(dto.DocumentFrontSide, "Documents/Verification");
            string backPath = await SaveSecureFileAsync(dto.DocumentBackSide, "Documents/Verification");

            // 3. Map to Entity with split URLs
            var document = new DocumentVerified
            {
                ProfileId = dto.ProfileId,
                DocumentType = dto.DocumentType,
                DocumentNumber = dto.DocumentNumber,
                DocumentFrontSideUrl = frontPath,
                DocumentBackSideUrl = backPath,
               
            };

            // 4. Call Service
            var result = await verificationService.SubmitDocumentAsync(document);

            return Ok(result);
        }

        [HttpPut("updatedocument/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] DocumentUpdateDTO dto)
        {
            var existing = await verificationService.GetByIdAsync(id);

            if (existing == null)
                return NotFound("Document not found.");

            // Update URLs if new files are uploaded
            if (dto.DocumentFrontSide != null)
                existing.DocumentFrontSideUrl = await SaveSecureFileAsync(dto.DocumentFrontSide, "Documents/Verification");

            if (dto.DocumentBackSide != null)
                existing.DocumentBackSideUrl = await SaveSecureFileAsync(dto.DocumentBackSide, "Documents/Verification");

            existing.DocumentNumber = dto.DocumentNumber;
            existing.DocumentType = dto.DocumentType;
           

            var result = await verificationService.UpdateDocumentAsync(existing);

            return Ok(result);
        }


    
        [HttpPatch("reviewdocuments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Review([FromQuery] Guid id, [FromBody] DocumentReviewDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

               
                var result = await verificationService.ReviewDocumentAsync(id, dto.Status, dto.Message);

                return Ok(result);
            }
            catch (ApiException ex)
            {
                // Returns the specific 400, 404, or 500 status set in the service
                return StatusCode(ex.StatusCode, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpGet("alldocuments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var documents = await verificationService.GetAllDocumentsAsync();
            return Ok(documents);
        }

        [HttpGet("userdocuments")]
        public async Task<IActionResult> GetUserDocs(Guid profileId)
        {
            return Ok(await verificationService.GetUserDocumentsAsync(profileId));
        }

        private async Task<string> SaveSecureFileAsync(IFormFile file, string folder)
        {
            var path = Path.Combine(env.WebRootPath, folder);

            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);

            // Security: Rename file to Guid to prevent metadata leaks or overwriting
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fullPath = Path.Combine(path, fileName);

            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);

            return $"/{folder}/{fileName}";
        }
    }
}