using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Boosting.Interface;
using ServAd.ApiService.Services.RabbitMq.Interface; 
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;

namespace ServAd.ApiService.Services.Boosting.Service
{
 public class BoostingService(
    ServiceDbContext context,
    IRabbitmqService rabbitMQ, // Added to Primary Constructor
    ILogger<BoostingService> logger) : IBoostingService
{
    public async Task<BoostingTransaction> BoostServiceAsync(Guid serviceId, int pointsToSpend, int days)
    {
        var service = await context.ServiceListings
            .Include(s => s.Profile)
            .FirstOrDefaultAsync(s => s.Id == serviceId)
            ?? throw new ApiException("Service not found.", 404);

        var profile = service.Profile;

        if (profile.BoostingPoints < pointsToSpend)
            throw new ApiException($"Insufficient boosting points. You have {profile.BoostingPoints} points.", 400);

        try
        {
            profile.BoostingPoints -= pointsToSpend;

            DateTime baseDate = (service.IsBoosted && service.BoostExpiry > DateTime.UtcNow)
                ? service.BoostExpiry.Value
                : DateTime.UtcNow;

            service.IsBoosted = true;
            service.BoostExpiry = baseDate.AddDays(days);

            var transaction = new BoostingTransaction
            {
                Id = Guid.NewGuid(),
                ServiceId = serviceId,
                PointsSpent = pointsToSpend,
                BoostStartDate = baseDate,
                BoostEndDate = service.BoostExpiry.Value
            };

            context.BoostingTransactions.Add(transaction);
            await context.SaveChangesAsync();

            // 🚀 Notify RabbitMQ that a service's ranking has changed
            await rabbitMQ.PublishMessageAsync(new
            {
                ServiceId = service.Id,
                Action = "ServiceBoosted",
                NewExpiry = service.BoostExpiry,
                IsBoosted = true,
                Timestamp = DateTime.UtcNow
            }, "service_boosted_queue");

            logger.LogInformation("Service {ServiceId} boosted. Message sent to RabbitMQ.", serviceId);

            return transaction;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Boosting failed for Service {Id}", serviceId);
            throw new ApiException("An error occurred while processing the boost.", 500);
        }
    }

    public async Task<IEnumerable<BoostingTransaction>> GetServiceBoostHistoryAsync(Guid serviceId)
    {
        return await context.BoostingTransactions
            .Where(t => t.ServiceId == serviceId)
            .OrderByDescending(t => t.BoostStartDate)
            .ToListAsync();
    }

    public async Task<bool> IsServiceCurrentlyBoostedAsync(Guid serviceId)
    {
        return await context.ServiceListings
            .AnyAsync(s => s.Id == serviceId && s.IsBoosted && s.BoostExpiry > DateTime.UtcNow);
    }
 }
}