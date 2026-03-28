using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using ServAd.ApiService.Hubs;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Workers;

// Primary Constructor used here (Fixes "Use primary constructor")
public class NotificationConsumerWorker(
    IServiceProvider serviceProvider,
    IHubContext<NotificationHub> hubContext,
    ILogger<NotificationConsumerWorker> logger,
    IConfiguration configuration) : BackgroundService
{
    private IConnection? _connection;
    private IChannel? _channel;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            var factory = new ConnectionFactory
            {
                HostName = configuration["RabbitMQ:Host"] ?? "localhost"
            };

            // V7 Uses Async methods
            _connection = await factory.CreateConnectionAsync(stoppingToken);
            _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);

            await _channel.QueueDeclareAsync(
                queue: "user_notification_queue",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null,
                cancellationToken: stoppingToken);

            var consumer = new AsyncEventingBasicConsumer(_channel);

            // Fixes Received event handler for v7
            consumer.ReceivedAsync += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);

                try
                {
                    var payload = JsonSerializer.Deserialize<NotificationPayload>(message);
                    if (payload != null)
                    {
                        await ProcessNotification(payload);
                    }

                    await _channel.BasicAckAsync(ea.DeliveryTag, false, stoppingToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing RabbitMQ message.");
                }
            };

            await _channel.BasicConsumeAsync(
                queue: "user_notification_queue",
                autoAck: false,
                consumer: consumer,
                cancellationToken: stoppingToken);

            // Keep the worker alive until cancellation
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "RabbitMQ Worker failed to start or lost connection.");
        }
    }

    private async Task ProcessNotification(NotificationPayload payload)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ServiceDbContext>();

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            ProfileId = payload.ProfileId,
            Title = payload.Title,
            Message = payload.Message,
            CreatedAt = DateTime.Now,
            IsRead = false
        };

        context.Notifications.Add(notification);
        await context.SaveChangesAsync();

        await hubContext.Clients.Group(payload.ProfileId.ToString())
            .SendAsync("ReceiveNotification", new
            {
                id = notification.Id,
                title = notification.Title,
                message = notification.Message,
                createdAt = notification.CreatedAt
            });
    }

    public override void Dispose()
    {
        // Fixes "prevent derived types from needing re-implement" warning
        _channel?.Dispose();
        _connection?.Dispose();
        base.Dispose();
        GC.SuppressFinalize(this);
    }
}

public class NotificationPayload
{
    public Guid ProfileId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}