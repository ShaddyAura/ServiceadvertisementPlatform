using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Services.Profile.Interface;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.Data.Entities;
using System.Security.Claims;

namespace ServAd.ApiService.Controllers.Profile
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController(IProfileService profileService) : ControllerBase
    {
        // GET: api/Profile/user/{userId}
        [HttpGet("userprofile")]
        public async Task<IActionResult> GetByUserId(Guid userId)
        {
            var profile = await profileService.GetByUserIdAsync(userId);
            return Ok(profile);
        }

        // GET: api/Profile/{id}
        [HttpGet("getprofile")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var profile = await profileService.GetByIdAsync(id);
            return Ok(profile);
        }

        // PUT: api/Profile/{id}
        [HttpPut("updateprofile")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Profiles profile)
        {
            if (id != profile.Id)
            {
                return BadRequest("ID mismatch between URL and body.");
            }

            var updatedProfile = await profileService.UpdateProfileAsync(profile);
            return Ok(updatedProfile);
        }

        // PATCH: api/Profile/verify/{id}
        [HttpPatch("verifyprofile")]
        public async Task<IActionResult> VerifyProfile(Guid id)
        {
            var success = await profileService.MarkAsVerifiedAsync(id);
            if (!success) return BadRequest("Verification failed.");

            return Ok(new { message = "Profile verified successfully." });
        }

        // POST: api/Profile/{id}/upload-image
        // NEW: Endpoint to handle profile picture uploads
        [HttpPost("uploadimageprofile")]
        public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file was uploaded.");
            }

            // Optional: Add file type/size validation here
            var permittedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(extension) || !permittedExtensions.Contains(extension))
            {
                return BadRequest("Invalid file type. Only JPG and PNG are allowed.");
            }

            var imageUrl = await profileService.UploadProfileImageAsync(id, file);

            return Ok(new
            {
                message = "Image uploaded successfully.",
                url = imageUrl
            });
        }
    }
}