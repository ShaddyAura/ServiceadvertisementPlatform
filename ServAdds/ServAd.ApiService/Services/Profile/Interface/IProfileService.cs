using ShareLibrary.Data.Entities;

namespace ServAd.ApiService.Services.Profile.Interface
{
    public interface IProfileService
    {
        Task<Profiles> GetByUserIdAsync(Guid userId);
        Task<Profiles> GetByIdAsync(Guid id);
        Task<Profiles> UpdateProfileAsync(Profiles profile);
        Task<bool> MarkAsVerifiedAsync(Guid profileId);
        Task<string> UploadProfileImageAsync(Guid profileId, IFormFile file);
        Task<IEnumerable<Profiles>> GetAllProfilesAsync();


        // New method for cascading dropdown data
        Dictionary<string, Dictionary<string, Dictionary<string, List<string>>>> GetNepalAddressHierarchy();
    }
}