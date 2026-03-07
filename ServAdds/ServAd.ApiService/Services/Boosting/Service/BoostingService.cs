using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Exceptions;
using ServAd.ApiService.Services.Boosting.Interface;
using ServAd.ApiService.Services.Notifications.Interface; // Added
using ServAd.ApiService.Services.RabbitMq.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Services.Boosting.Service
{
    public class BoostingService(
        ServiceDbContext context,
        IRabbitmqService rabbitMQ,
        INotificationService notification, // Added Notification Service
        ILogger<BoostingService> logger) : IBoostingService
    {
        public async Task<BoostingTransaction> BoostServiceAsync(
            Guid serviceId,
            BoostLevel level,
            int pointsToSpend,
            int days)
        {
            var service = await context.ServiceListings
                .Include(s => s.Profile)
                .FirstOrDefaultAsync(s => s.Id == serviceId)
                ?? throw new ApiException("Service not found.", 404);

            var profile = service.Profile;

            if (profile.BoostingPoints < pointsToSpend)
                throw new ApiException(
                    $"Insufficient boosting points. You have {profile.BoostingPoints} points.", 400);

            try
            {
                profile.BoostingPoints -= pointsToSpend;

                DateTime now = DateTime.UtcNow;

                DateTime startDate =
                    service.BoostExpiry.HasValue && service.BoostExpiry > now
                        ? service.BoostExpiry.Value
                        : now;

                DateTime endDate = startDate.AddDays(days);

                service.BoostLevel = level;
                service.BoostExpiry = endDate;

                var transaction = new BoostingTransaction
                {
                    Id = Guid.NewGuid(),
                    ServiceId = serviceId,
                    PointsSpent = pointsToSpend,
                    BoostStartDate = startDate,
                    BoostEndDate = endDate
                };

                context.BoostingTransactions.Add(transaction);
                await context.SaveChangesAsync();

                // --- Notification Added ---
                await notification.NotifyBoostingActivated(
                    serviceId,
                    service.ProfileId,
                    endDate,
                    pointsToSpend);

                await rabbitMQ.PublishMessageAsync(new
                {
                    ServiceId = service.Id,
                    BoostLevel = service.BoostLevel.ToString(),
                    BoostExpiry = service.BoostExpiry,
                    Timestamp = now
                }, "service_boosted_queue");

                logger.LogInformation(
                    "Service {ServiceId} boosted to {Level} until {Expiry}",
                    serviceId, level, endDate);

                return transaction;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Boosting failed for Service {Id}", serviceId);
                throw new ApiException("An error occurred while processing the boost.", 500);
            }
        }

        public async Task<IEnumerable<BoostingTransaction>>
            GetServiceBoostHistoryAsync(Guid serviceId)
        {
            return await context.BoostingTransactions
                .Where(t => t.ServiceId == serviceId)
                .OrderByDescending(t => t.BoostStartDate)
                .ToListAsync();
        }

        public async Task<bool> IsServiceCurrentlyBoostedAsync(Guid serviceId)
        {
            var service = await GetServiceAsync(serviceId);
            return await CheckAndHandleExpiry(service);
        }

        public async Task<BoostLevel> GetCurrentBoostLevelAsync(Guid serviceId)
        {
            var service = await GetServiceAsync(serviceId);

            var isActive = await CheckAndHandleExpiry(service);

            return isActive ? service.BoostLevel : BoostLevel.None;
        }

        public async Task<BoostingTransaction?> GetServiceBoostInfoAsync(Guid serviceId)
        {
            var latestBoost = await context.BoostingTransactions
                .Where(x => x.ServiceId == serviceId)
                .OrderByDescending(x => x.BoostEndDate)
                .FirstOrDefaultAsync();

            return latestBoost;
        }

        public async Task CancelBoostAsync(Guid serviceId)
        {
            var service = await context.ServiceListings
                .FirstOrDefaultAsync(s => s.Id == serviceId)
                ?? throw new ApiException("Service not found.", 404);

            bool isCurrentlyBoosted = service.BoostLevel != BoostLevel.None &&
                                       service.BoostExpiry.HasValue &&
                                       service.BoostExpiry > DateTime.UtcNow;

            if (!isCurrentlyBoosted)
            {
                logger.LogInformation("CancelBoost requested for Service {ServiceId}, but it was already inactive.", serviceId);
                return;
            }

            try
            {
                service.BoostLevel = BoostLevel.None;
                service.BoostExpiry = null;

                await context.SaveChangesAsync();

                // Safe RabbitMQ call
                await rabbitMQ.PublishMessageAsync(new
                {
                    ServiceId = service.Id,
                    BoostLevel = "None",
                    BoostExpiry = (DateTime?)null,
                    Timestamp = DateTime.UtcNow
                }, "service_boosted_queue");

                logger.LogInformation("Boost cancelled successfully for Service {ServiceId}", serviceId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error cancelling boost for Service {ServiceId}", serviceId);
                throw new ApiException("An error occurred while cancelling boost.", 500);
            }
        }

        private async Task<ServiceListings> GetServiceAsync(Guid serviceId)
        {
            return await context.ServiceListings
                .FirstOrDefaultAsync(s => s.Id == serviceId)
                ?? throw new ApiException("Service not found.", 404);
        }

        private async Task<bool> CheckAndHandleExpiry(ServiceListings service)
        {
            var now = DateTime.UtcNow;

            var isActive =
                service.BoostLevel != BoostLevel.None &&
                service.BoostExpiry.HasValue &&
                service.BoostExpiry > now;

            if (!isActive && service.BoostLevel != BoostLevel.None)
            {
                service.BoostLevel = BoostLevel.None;
                service.BoostExpiry = null;
                await context.SaveChangesAsync();
            }

            return isActive;
        }
    }
}