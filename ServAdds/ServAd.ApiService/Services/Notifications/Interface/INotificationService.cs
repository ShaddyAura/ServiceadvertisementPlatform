using ServAd.ApiService.Services.RabbitMq.Interface;
using static ShareLibrary.cs.Data.Entities.Messages;

namespace ServAd.ApiService.Services.Notifications.Services
{
    public interface INotificationService
    {
        Task NotifyPaymentSuccess(Guid profileId, decimal amount, string gateway);
        Task NotifyDocumentVerified(Guid profileId, string email);
    }

    public class NotificationService(IRabbitmqService rabbitMQ) : INotificationService
    {
        public async Task NotifyPaymentSuccess(Guid profileId, decimal amount, string gateway)
        {
            var message = new PaymentProcessedMessage(profileId, amount, gateway, Guid.NewGuid().ToString());
            await rabbitMQ.PublishMessageAsync(message, "payment_notifications");
        }

        public async Task NotifyDocumentVerified(Guid profileId, string email)
        {
            // Custom message for verification
            await rabbitMQ.PublishMessageAsync(new { ProfileId = profileId, Email = email, Message = "Your ID has been verified!" });
        }
    }
}
