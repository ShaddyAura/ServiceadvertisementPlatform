using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Booking.Interface;
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;
using ShareLibrary.cs.Data.Message;

namespace ServAd.ApiService.Services.Booking.Service
{

    public class ServAddBookingService(
        ServiceDbContext context,
        IRabbitmqService rabbitMQ,
        ILogger<ServAddBookingService> logger) : IServAddBooking
    {
        public async Task<Bookings> CreateAsync(Bookings booking)
        {
            try
            {
                // Ensure ID and default status are set if not provided
                if (booking.Id == Guid.Empty) booking.Id = Guid.NewGuid();
                booking.Status = BookingStatus.Pending;

                context.Bookings.Add(booking);
                await context.SaveChangesAsync();

                // Notify RabbitMQ
                await rabbitMQ.PublishMessageAsync(new BookingNotification(
                    booking.Id,
                    "customer@email.com", // These should ideally come from profile lookups
                    "provider@email.com",
                    booking.Status.ToString()
                ));

                return booking;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to persist booking for Service {ServiceId}", booking.ServiceId);
                throw new ApiException("Database error during booking creation.", 500);
            }
        }

        public async Task<IEnumerable<Bookings>> GetAllAsync() =>
            await context.Bookings.Include(b => b.Service).AsNoTracking().ToListAsync();

        public async Task<Bookings> GetByIdAsync(Guid id) =>
            await context.Bookings.Include(b => b.Service).FirstOrDefaultAsync(b => b.Id == id)
            ?? throw new ApiException($"Booking {id} not found.", 404);

        public async Task UpdateStatusAsync(Guid id, BookingStatus status)
        {
            var booking = await GetByIdAsync(id);
            booking.Status = status;
            await context.SaveChangesAsync();

            await rabbitMQ.PublishMessageAsync(new { BookingId = id, Status = status.ToString() });
        }

        public async Task DeleteAsync(Guid id)
        {
            var booking = await context.Bookings.FindAsync(id)
                ?? throw new ApiException("Booking not found.", 404);

            context.Bookings.Remove(booking);
            await context.SaveChangesAsync();
        }
    }
}