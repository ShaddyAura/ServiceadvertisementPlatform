using Microsoft.AspNetCore.Mvc;
using ServAd.ApiService.Controllers.Booking.Dto;
using ServAd.ApiService.Services.Booking.Interface;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Controllers.Booking
{

    [ApiController]
    [Route("api/[controller]")]
    public class BookingController(IServAddBooking bookingService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bookings>>> GetAll()
        {
            var bookings = await bookingService.GetAllAsync();
            return Ok(bookings);
        }

        [HttpGet("getbooking")]
        public async Task<ActionResult<Bookings>> GetById(Guid id)
        {
            var booking = await bookingService.GetByIdAsync(id);
            return Ok(booking);
        }

        [HttpPost("savebooking")]
        public async Task<ActionResult<Bookings>> Create([FromBody] BookingCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // ✅ Mapping DTO to Entity Model here in the Controller
            var bookingModel = new Bookings
            {
                ServiceId = dto.ServiceId,
                CustomerProfileId = dto.CustomerProfileId,
                ProviderProfileId = dto.ProviderProfileId,
                ScheduledAt = dto.ScheduledAt,
                Status = BookingStatus.Pending // Default status
            };

            // ✅ Call Service with the Entity Model directly
            var result = await bookingService.CreateAsync(bookingModel);

            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPatch("bookingstatus")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] BookingStatus status)
        {
            await bookingService.UpdateStatusAsync(id, status);
            return NoContent();
        }

        [HttpDelete("deletebooking")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await bookingService.DeleteAsync(id);
            return NoContent();
        }
    }
}