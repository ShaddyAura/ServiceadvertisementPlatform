using ShareLibrary.Data.Entities;

namespace ServAd.ApiService.Services.Profile.Interface
{
    public interface IProfileService
    {
        Task<Profiles> GetByUserIdAsync(Guid userId);
        Task<Profiles> GetByIdAsync(Guid id);
        Task<Profiles> UpdateProfileAsync(Profiles profile);
        Task<bool> MarkAsVerifiedAsync(Guid profileId);
        // NEW: Method to handle profile picture upload
        Task<string> UploadProfileImageAsync(Guid profileId, IFormFile file);
    }
}