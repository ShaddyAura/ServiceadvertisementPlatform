using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using ServAd.ApiService.Configuration;
using ServAd.ApiService.Services.RabbitMq.Interface;
using System.Text;
using System.Text.Json;

namespace ServAd.ApiService.Services.RabbitMq.Service
{
    public class RabbitmqService : IRabbitmqService
    {
        private readonly RabbitMqSettings _settings;
        private readonly ILogger<RabbitmqService> _logger;

        public RabbitmqService(IOptions<RabbitMqSettings> options, ILogger<RabbitmqService> logger)
        {
            _settings = options.Value;
            _logger = logger;
        }

        public void PublishMessage<T>(T message, string? queueOverride = null)
        {
            throw new NotImplementedException();
        }

        public async Task PublishMessageAsync<T>(T message, string? queueOverride = null)
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _settings.Host,
                    Port = _settings.Port,
                    UserName = _settings.Username,
                    Password = _settings.Password
                };

                // Create connection and channel asynchronously
                using var connection = await factory.CreateConnectionAsync();
                using var channel = await connection.CreateChannelAsync();

                var queueName = queueOverride ?? _settings.Queue;

                // Declare Exchange and Queue using settings
                await channel.ExchangeDeclareAsync(_settings.Exchange, ExchangeType.Direct);
                await channel.QueueDeclareAsync(queueName, durable: true, exclusive: false, autoDelete: false);
                await channel.QueueBindAsync(queueName, _settings.Exchange, _settings.RoutingKey);

                var json = JsonSerializer.Serialize(message);
                var body = Encoding.UTF8.GetBytes(json);

                // Publish using the modern async method
                await channel.BasicPublishAsync(
                    exchange: _settings.Exchange,
                    routingKey: _settings.RoutingKey,
                    body: body);

                _logger.LogInformation("✅ Message sent to {Queue} via {Exchange}", queueName, _settings.Exchange);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ RabbitMQ: Failed to publish message.");
            }
        }
    }
}