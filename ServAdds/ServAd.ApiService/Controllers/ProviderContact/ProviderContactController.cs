using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using ServAd.ApiService.Controllers.ProviderContact.Dto;

namespace ServAd.ApiService.Controllers.ProviderContact
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProviderContactController : ControllerBase
    {
        private readonly ServiceDbContext _context;

        public ProviderContactController(ServiceDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile/{profileId}")]
        public async Task<IActionResult> GetByProfileId(Guid profileId)
        {
            var contacts = await _context.ProviderContacts
                .Where(c => c.ProfileId == profileId)
                .AsNoTracking()
                .ToListAsync();

            return Ok(contacts);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProviderContactDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var contact = new ShareLibrary.cs.Data.Entities.ProviderContact
            {
                ProfileId = dto.ProfileId,
                ProviderName = dto.ProviderName,
                MobileNo = dto.MobileNo,
                Location = dto.Location,
                Email = dto.Email,
                OperatingHours = dto.OperatingHours
            };

            _context.ProviderContacts.Add(contact);
            await _context.SaveChangesAsync();

            return Ok(contact);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProviderContactDto dto)
        {
            var existing = await _context.ProviderContacts.FindAsync(id);
            if (existing == null)
                return NotFound("Contact not found.");

            existing.ProviderName = dto.ProviderName;
            existing.MobileNo = dto.MobileNo;
            existing.Location = dto.Location;
            existing.Email = dto.Email;
            existing.OperatingHours = dto.OperatingHours;

            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _context.ProviderContacts.FindAsync(id);
            if (existing == null)
                return NotFound("Contact not found.");

            _context.ProviderContacts.Remove(existing);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
