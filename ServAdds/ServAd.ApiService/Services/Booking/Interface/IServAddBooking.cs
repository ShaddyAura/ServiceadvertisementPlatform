using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Services.Booking.Interface
{

    public interface IServAddBooking
    {
        Task<IEnumerable<Bookings>> GetAllAsync();
        Task<Bookings> GetByIdAsync(Guid id);
        // ✅ Interface now strictly uses the Model (Entity)
        Task<Bookings> CreateAsync(Bookings booking);
        Task UpdateStatusAsync(Guid id, BookingStatus status, string? gateway = null);
        Task DeleteAsync(Guid id);
    }
}