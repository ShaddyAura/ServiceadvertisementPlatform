using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.Profile.Dto;
using ServAd.ApiService.Services.Profile.Interface;
using ServAd.ApiService.Services.Profile.Service;

namespace ServAd.ApiService.Controllers.Profile
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController(IProfileService profileService) : ControllerBase
    {
        // GET: api/Profile/userprofile?userId={guid}
        [HttpGet("userprofile")]
        public async Task<ActionResult<ProfileReadDto>> GetByUserId([FromQuery] Guid userId)
        {
            var profile = await profileService.GetByUserIdAsync(userId);
            return Ok(MapToReadDto(profile));
        }

        // GET: api/Profile/addresshierarchy
        [HttpGet("addresshierarchy")]
        public IActionResult GetAddressHierarchy()
        {
            var hierarchy = profileService.GetNepalAddressHierarchy();
            return Ok(hierarchy);
        }

        // GET: api/Profile/getprofile?id={guid}
        [HttpGet("getprofile")]
        public async Task<ActionResult<ProfileReadDto>> GetById([FromQuery] Guid id)
        {
            var profile = await profileService.GetByIdAsync(id);
            return Ok(MapToReadDto(profile));
        }

        // PUT: api/Profile/updateprofile
        [HttpPut("updateprofile")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProfileDto updateDto)
        {
            if (id != updateDto.Id)
                return BadRequest("ID mismatch.");

            var existingProfile = await profileService.GetByIdAsync(id);

            if (existingProfile == null)
                return NotFound();

            existingProfile.PhoneNumber = updateDto.PhoneNumber;
            existingProfile.Address = updateDto.Address;
            existingProfile.DateOfBirth = updateDto.DateOfBirth;

            var result = await profileService.UpdateProfileAsync(existingProfile);

            return Ok(MapToReadDto(result));
        }

        // PATCH: api/Profile/verifyprofile?id={guid}
        [HttpPatch("verifyprofile")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> VerifyProfile(Guid id)
        {
            var success = await profileService.MarkAsVerifiedAsync(id);

            if (!success)
                return BadRequest("Verification failed.");

            return Ok(new { message = "Profile verified successfully." });
        }

        [HttpGet("allprofiles")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ProfileReadDto>>> GetAll()
        {
            var profiles = await profileService.GetAllProfilesAsync();

            // Map to DTO for the frontend table
            var result = profiles.Select(p => new ProfileReadDto
            {
                Id = p.Id,
                FirstName = p.FirstName,
                LastName = p.LastName,
                PhoneNumber = p.PhoneNumber,
                Address = p.Address,
                IsVerified = p.IsVerified,
                IsSuspended = p.IsSuspended,
                SuspensionReason = p.SuspensionReason,
                ProfileImageUrl = p.ProfileImageUrl,
                CreatedAt = p.CreatedAt
            });

            return Ok(result);
        }

        // POST: api/Profile/uploadimageprofile?id={guid}
        [HttpPost("uploadimageprofile")]
        public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file was uploaded.");

            var permittedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(extension) || !permittedExtensions.Contains(extension))
                return BadRequest("Invalid file type. Only JPG and PNG are allowed.");

            var imageUrl = await profileService.UploadProfileImageAsync(id, file);

            return Ok(new
            {
                message = "Image uploaded successfully.",
                url = imageUrl
            });
        }

        [HttpPatch("togglesuspension")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleSuspension(Guid id, [FromQuery] string? reason)
        {
            var success = await profileService.ToggleSuspensionAsync(id, reason);

            if (!success)
                return BadRequest("Suspension update failed.");

            return Ok(new { message = "User suspension status updated successfully." });
        }

        private static ProfileReadDto MapToReadDto(ShareLibrary.cs.Data.Entities.Profiles p)
        {
            return new ProfileReadDto
            {
                Id = p.Id,
                UserId = p.UserId,
                FirstName = p.FirstName,
                LastName = p.LastName,
                PhoneNumber = p.PhoneNumber,
                Address = p.Address,
                DateOfBirth = p.DateOfBirth,
                ProfileImageUrl = p.ProfileImageUrl,
                IsVerified = p.IsVerified,
                IsSuspended = p.IsSuspended,
                SuspensionReason = p.SuspensionReason,
                BoostingPoints = p.BoostingPoints,
                LifetimePoints = p.LifetimePoints,
                CreatedAt = p.CreatedAt
            };
        }
    }
}