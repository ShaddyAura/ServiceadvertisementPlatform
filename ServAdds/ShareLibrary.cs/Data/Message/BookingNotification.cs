
namespace ShareLibrary.cs.Data.Message
{
    public record BookingNotification(
         Guid BookingId,
         string CustomerEmail,
         string ProviderEmail,
         string Status
     );
}
