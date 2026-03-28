
using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Profile.Interface;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Profile.Service
{
    public class ProfileService(
        ServiceDbContext context,
        IRabbitmqService rabbitMQ,
        IWebHostEnvironment env,
        ILogger<ProfileService> logger) : IProfileService
    {
        private const string UploadFolder = "Profiles";

        public Dictionary<string, Dictionary<string, Dictionary<string, List<string>>>> GetNepalAddressHierarchy()
        {
            var path = Path.Combine(env.WebRootPath, "CSV", "nepal_Places.csv");
            var hierarchy = new Dictionary<string, Dictionary<string, Dictionary<string, List<string>>>>();

            if (!File.Exists(path)) return hierarchy;

            try
            {
                using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                using var reader = new StreamReader(stream);

                reader.ReadLine(); // Skip header

                while (!reader.EndOfStream)
                {
                    var rawLine = reader.ReadLine();
                    if (string.IsNullOrWhiteSpace(rawLine)) continue;

                    var line = rawLine.Split(',');
                    if (line.Length < 4) continue;

                    // CLEANING: Remove quotes and whitespace
                    string p = line[0].Trim('"').Trim();
                    string d = line[1].Trim('"').Trim();
                    string m = line[2].Trim('"').Trim();

                    if (string.IsNullOrWhiteSpace(p) || string.IsNullOrWhiteSpace(d) || string.IsNullOrWhiteSpace(m))
                        continue;

                    // STRICTOR FILTERING:
                    // 1. Only allow rows where the first column actually contains "Province"
                    // 2. Explicitly skip known corrupted municipality names appearing in the province column
                    var skipKeywords = new[] { "RM municipality", "Municipality", "MP Municipality", "KarMatong", "Monohara" };

                    bool isCorrupted = skipKeywords.Any(k => p.Contains(k, StringComparison.OrdinalIgnoreCase)) ||
                                      !p.Contains("Province", StringComparison.OrdinalIgnoreCase);

                    if (isCorrupted) continue;

                    // Process valid data
                    if (!hierarchy.TryGetValue(p, out var pDict)) { pDict = new(); hierarchy[p] = pDict; }
                    if (!pDict.TryGetValue(d, out var dDict)) { dDict = new(); pDict[d] = dDict; }
                    if (!dDict.TryGetValue(m, out var mList)) { mList = new List<string>(); dDict[m] = mList; }

                    // WARD COLLECTION: Skip the first 3 columns (P, D, M) and treat the rest as wards
                    string rawWards = string.Join(",", line.Skip(3)).Trim('"').Trim();
                    var wardList = rawWards.Split(',')
                                           .Select(w => w.Replace("\"", "").Trim())
                                           .Where(w => !string.IsNullOrEmpty(w));

                    foreach (var ward in wardList)
                    {
                        if (!hierarchy[p][d][m].Contains(ward))
                        {
                            hierarchy[p][d][m].Add(ward);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error parsing CSV");
            }

            return hierarchy;
        }

        public async Task<Profiles> UpdateProfileAsync(Profiles profile)
        {
            // We fetch the latest version to ensure we aren't overwriting other fields accidentally
            var existing = await context.Profiles.FindAsync(profile.Id)
                ?? throw new ApiException("Profile not found.", 404);

            // ONLY UPDATE: Phone, Address (the concatenated string from dropdowns), and DOB
            existing.PhoneNumber = profile.PhoneNumber;
            existing.Address = profile.Address;
            existing.DateOfBirth = profile.DateOfBirth;
            existing.UpdatedAt = DateTime.UtcNow;

            context.Profiles.Update(existing);
            await context.SaveChangesAsync();

            await rabbitMQ.PublishMessageAsync(new
            {
                existing.Id,
                Action = "Updated",
                existing.PhoneNumber,
                existing.Address,
                existing.DateOfBirth,
                Timestamp = existing.UpdatedAt
            }, "profile_updates_queue");

            return existing;
        }

        // --- Existing Methods ---

        public async Task<Profiles> GetByUserIdAsync(Guid userId) =>
            await context.Profiles
                .Include(p => p.Wallet)
                .FirstOrDefaultAsync(p => p.UserId == userId)
                ?? throw new ApiException("Profile not found.", 404);

        public async Task<Profiles> GetByIdAsync(Guid id) =>
            await context.Profiles.FindAsync(id)
            ?? throw new ApiException("Profile not found.", 404);

        public async Task<bool> MarkAsVerifiedAsync(Guid profileId)
        {
            var profile = await GetByIdAsync(profileId);
            profile.IsVerified = true;
            profile.UpdatedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Profiles>> GetAllProfilesAsync()
        {
            // Fetch only profiles without any related document or wallet data
            return await context.Profiles
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<string> UploadProfileImageAsync(Guid profileId, IFormFile file)
        {
            var profile = await GetByIdAsync(profileId);
            var relativePath = await SaveToDiskAsync(file);
            profile.ProfileImageUrl = relativePath;
            profile.UpdatedAt = DateTime.UtcNow;
            context.Profiles.Update(profile);
            await context.SaveChangesAsync();
            return relativePath;
        }

        private async Task<string> SaveToDiskAsync(IFormFile file)
        {
            if (string.IsNullOrWhiteSpace(env.WebRootPath))
                throw new ApiException("wwwroot folder not found.", 500);

            var folderPath = Path.Combine(env.WebRootPath, UploadFolder);
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return $"/{UploadFolder}/{fileName}";
        }
    }
}