using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Booking.Interface;
using ServAd.ApiService.Services.Notifications.Interface; // Added
using ServAd.ApiService.Services.RabbitMq.Interface;
using ServAd.ApiService.Services.Wallet.Interface; // Added
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
        IUserWalletService walletService, // Added
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

                try 
                {
                    // --- Notification Added ---
                    await notification.NotifyBookingUpdate(
                        booking.Id,
                        booking.ProfileId,
                        booking.ProviderProfileId,
                        booking.Status.ToString(),
                        booking.AgreedPrice);

                    await rabbitMQ.PublishMessageAsync(new { BookingId = booking.Id, Action = "BookingCreated" }, "booking_events");
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to publish booking creation event for {BookingId}. Proceeding.", booking.Id);
                }

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

        public async Task UpdateStatusAsync(Guid id, BookingStatus status, string? gateway = null)
        {
            var booking = await GetByIdAsync(id);
            
            // Prevent duplicate logs if already Paid
            if (booking.Status == status) return;

            booking.Status = status;

            if (status == BookingStatus.Paid)
            {
                // 1. Record in General Payment History
                var paymentHistory = new UserRewardHistory
                {
                    Id = Guid.NewGuid(),
                    ProfileId = booking.ProfileId,
                    RewardType = "BookingPayment",
                    PointsEarned = 0,
                    Amount = booking.AgreedPrice,
                    BookingId = booking.Id,
                    CreatedAt = DateTime.UtcNow
                };
                context.UserRewardHistories.Add(paymentHistory);

                // 2. Record in Dedicated BookingPayments Table with Commission
                decimal totalAmount = booking.AgreedPrice;
                decimal commissionRate = 0.10m; // 10% Platform Fee
                decimal platformFee = totalAmount * commissionRate;
                decimal netAmount = totalAmount - platformFee;

                var bookingPayment = new BookingPayment
                {
                    Id = Guid.NewGuid(),
                    BookingId = booking.Id,
                    Amount = totalAmount,
                    PlatformFee = platformFee,
                    NetAmount = netAmount,
                    Gateway = gateway ?? "Unknown",
                    ProviderProfileId = booking.ProviderProfileId,
                    CustomerProfileId = booking.ProfileId,
                    CreatedAt = DateTime.UtcNow
                };
                context.BookingPayments.Add(bookingPayment);

                // 3. Update Provider's Wallet Balance (With Net Amount only)
                if (!string.IsNullOrEmpty(gateway))
                {
                    await walletService.AddBookingRevenueAsync(booking.ProviderProfileId, netAmount, gateway);
                }
            }

            await context.SaveChangesAsync();

            try 
            {
                // --- Notification Added ---
                await notification.NotifyBookingUpdate(
                    booking.Id,
                    booking.ProfileId,
                    booking.ProviderProfileId,
                    status.ToString(),
                    booking.AgreedPrice);

                await rabbitMQ.PublishMessageAsync(new { BookingId = id, Status = status.ToString() }, "booking_events");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to publish booking update notification/event for {BookingId}. Proceeding.", booking.Id);
            }
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