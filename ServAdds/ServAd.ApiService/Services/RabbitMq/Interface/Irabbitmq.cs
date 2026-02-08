namespace ServAd.ApiService.Services.RabbitMq.Interface
{
    public interface IRabbitmqService
    {
        Task PublishMessageAsync<T>(T message, string? queueOverride = null);
    }
}