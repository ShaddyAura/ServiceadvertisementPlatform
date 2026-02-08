using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.ServiceListing.Dto;
using ServAd.ApiService.Services.ServiceListing.Interface;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Controllers.ServiceListing
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceListingController : ControllerBase
    {
        private readonly IServiceListing _serviceListingService;

        public ServiceListingController(IServiceListing serviceListingService)
        {
            _serviceListingService = serviceListingService;
        }

        // GET: api/ServiceListing/all-services
        [HttpGet("allservices")]
        public async Task<IActionResult> GetAll()
        {
            var services = await _serviceListingService.GetAllAsync();
            return Ok(services);
        }

        // GET: api/ServiceListing/get-service/guid
        [HttpGet("getservice")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var service = await _serviceListingService.GetByIdAsync(id);
            return Ok(service);
        }

        // POST: api/ServiceListing/create-service
        [HttpPost("createservice")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] ServiceListingCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // ❌ Block both image & video
            if (dto.ImageFile != null && dto.VideoFile != null)
                return BadRequest("Upload either an image OR a video, not both.");

            var model = MapDtoToEntity(dto);

            var result = await _serviceListingService.CreateAsync(
                model,
                dto.ImageFile,
                dto.VideoFile
            );

            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // PUT: api/ServiceListing/update-service/guid
        [HttpPut("updateservice")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] ServiceListingCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.ImageFile != null && dto.VideoFile != null)
                return BadRequest("Upload either an image OR a video, not both.");

            var model = MapDtoToEntity(dto);
            model.Id = id;

            await _serviceListingService.UpdateAsync(
                model,
                dto.ImageFile,
                dto.VideoFile
            );

            return NoContent();
        }

        // DELETE: api/ServiceListing/delete-service/guid
        [HttpDelete("deleteservice")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _serviceListingService.DeleteAsync(id);
            return NoContent();
        }

        // ---------------- HELPER ----------------

        private static ServiceListings MapDtoToEntity(ServiceListingCreateDto dto)
        {
            return new ServiceListings
            {
                ProfileId = dto.ProfileId,
                Title = dto.Title,
                Description = dto.Description ?? string.Empty,
                Category = dto.Category,
                Price = dto.Price,

                StartTime = TimeSpan.TryParse(dto.StartTime, out var start)
                    ? start
                    : TimeSpan.Zero,

                EndTime = TimeSpan.TryParse(dto.EndTime, out var end)
                    ? end
                    : TimeSpan.Zero,

                Status = dto.Status
            };
        }
    }
}