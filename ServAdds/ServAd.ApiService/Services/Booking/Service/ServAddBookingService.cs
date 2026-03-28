using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Booking.Interface;
using ServAd.ApiService.Services.Notifications.Interface; // Added
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
        INotificationService notification, 
        ILogger<ServAddBookingService> logger) : IServAddBooking
    {
        public async Task<Bookings> CreateAsync(Bookings booking)
        {
            // 1. Check if the service actually exists in the DB
            var serviceExists = await context.ServiceListings.AnyAsync(s => s.Id == booking.ServiceId);

            if (!serviceExists)
            {
                throw new ApiException($"The Service ID {booking.ServiceId} does not exist in the database. Please provide a valid Service ID.", 400);
            }

            try
            {
                if (booking.Id == Guid.Empty) booking.Id = Guid.NewGuid();
                context.Bookings.Add(booking);
                await context.SaveChangesAsync();

                // --- Notification Added ---
                await notification.NotifyBookingUpdate(
                    booking.Id,
                    booking.ProfileId,
                    booking.ProviderProfileId,
                    booking.Status.ToString(),
                    booking.AgreedPrice);

                // ... RabbitMQ logic ...
                return booking;
            }
            catch (Exception ex)
            {
                var sqlError = ex.InnerException?.Message ?? ex.Message;
                logger.LogError(ex, "Database Failure: {SqlError}", sqlError);
                throw new ApiException($"Database error: {sqlError}", 500);
            }
        }

        public async Task<IEnumerable<Bookings>> GetAllAsync() =>
            await context.Bookings
                .Include(b => b.Service)
                .Include(b => b.Profile)
                .AsNoTracking()
                .ToListAsync();

        public async Task<Bookings> GetByIdAsync(Guid id) =>
            await context.Bookings
                .Include(b => b.Service)
                .Include(b => b.Profile)
                .FirstOrDefaultAsync(b => b.Id == id)
            ?? throw new ApiException($"Booking {id} not found.", 404);

        public async Task UpdateStatusAsync(Guid id, BookingStatus status)
        {
            var booking = await GetByIdAsync(id);
            booking.Status = status;
            await context.SaveChangesAsync();

            // --- Notification Added ---
            await notification.NotifyBookingUpdate(
                booking.Id,
                booking.ProfileId,
                booking.ProviderProfileId,
                status.ToString(),
                booking.AgreedPrice);

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