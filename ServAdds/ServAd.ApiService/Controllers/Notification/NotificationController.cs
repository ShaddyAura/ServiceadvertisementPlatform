using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Controllers.Notification.Dto;
using ServAd.ApiService.Services.Notifications.Interface;
using ShareLibrary.cs.Data;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.cs.Data.Enums;
using System;

namespace ServAd.ApiService.Controllers.Notification
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController(ServiceDbContext context, INotificationService notify) : ControllerBase
    {
        // 1. Get all notifications for a specific user profile
        [HttpGet("{profileId}")]
        public async Task<ActionResult<IEnumerable<NotificationResponseDto>>> GetUserNotifications(Guid profileId)
        {
            return await context.Notifications
                .Where(n => n.ProfileId == profileId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationResponseDto(n.Id, n.Title, n.Message, n.ActionUrl, n.IsRead, n.CreatedAt))
                .ToListAsync();
        }

        // 2. Mark a notification as read
        [HttpPatch("markread/{id}")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var notification = await context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            return NoContent();
        }

        // --- MANUAL TRIGGER ENDPOINTS FOR ALL SERVICES ---

        [HttpPost("trigger-booking")]
        public async Task<IActionResult> TriggerBooking(Guid bookingId, Guid customerId, Guid providerId, BookingStatus status, decimal price)
        {
            await notify.NotifyBookingUpdate(bookingId, customerId, providerId, status.ToString(), price);
            return Ok(new { Message = "Booking notification triggered" });
        }

        [HttpPost("trigger-chat")]
        public async Task<IActionResult> TriggerChat(Guid receiverId, Guid senderId, Guid bookingId, string messageText)
        {
            await notify.NotifyNewChat(receiverId, senderId, bookingId, messageText);
            return Ok(new { Message = "Chat notification triggered" });
        }

        [HttpPost("trigger-payment")]
        public async Task<IActionResult> TriggerPayment(Guid profileId, decimal amount, string gateway, string transactionId)
        {
            await notify.NotifyWalletUpdate(profileId, amount, gateway, transactionId);
            return Ok(new { Message = "Payment notification triggered" });
        }

        [HttpPost("trigger-wallet")]
        public async Task<IActionResult> TriggerWallet(Guid profileId, int pointsBalance, decimal cashBalance, string updateType)
        {
            await notify.NotifyPointWalletUpdate(profileId, pointsBalance, cashBalance, updateType);
            return Ok(new { Message = "Wallet update notification triggered" });
        }

        [HttpPost("trigger-points")]
        public async Task<IActionResult> TriggerPoints(Guid profileId, int pointsAdded, string reason)
        {
            await notify.NotifyPointsEarned(profileId, pointsAdded, reason);
            return Ok(new { Message = "Points earned notification triggered" });
        }

        [HttpPost("trigger-gift")]
        public async Task<IActionResult> TriggerGift(Guid profileId, string giftTitle, string voucherCode)
        {
            await notify.NotifyGiftRedeemed(profileId, giftTitle, voucherCode);
            return Ok(new { Message = "Gift redemption notification triggered" });
        }

        [HttpPost("trigger-boost")]
        public async Task<IActionResult> TriggerBoost(Guid serviceId, Guid profileId, int pointsSpent)
        {
            // Set expiry for 30 days from now for manual test
            await notify.NotifyBoostingActivated(serviceId, profileId, DateTime.UtcNow.AddDays(30), pointsSpent);
            return Ok(new { Message = "Boosting notification triggered" });
        }

        [HttpPost("sendmanual")]
        public async Task<IActionResult> SendManual(CreateManualNotificationDto dto)
        {
            // Re-using NotifyServiceAdded as a general "Service Notification" trigger
            await notify.NotifyServiceAdded(dto.ProfileId, dto.Title);
            return Ok(new { Message = "Manual notification queued successfully" });
        }

        [HttpPost("broadcast")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<IActionResult> Broadcast([FromBody] BroadcastDto dto)
        {
            var targets = await context.Profiles.ToListAsync();

            if (dto.Audience == "Providers Only")
            {
                // In our system Providers have services OR role = 2 depending on your struct
                var providerIds = await context.ServiceListings.Select(s => s.ProfileId).Distinct().ToListAsync();
                targets = targets.Where(p => providerIds.Contains(p.Id)).ToList();
            }

            var notifications = targets.Select(p => new ShareLibrary.cs.Data.Entities.Notification
            {
                Id = Guid.NewGuid(),
                ProfileId = p.Id,
                Title = dto.Title,
                Message = dto.Message,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            }).ToList();

            context.Notifications.AddRange(notifications);
            await context.SaveChangesAsync();

            return Ok(new { Message = $"Broadcast sent to {notifications.Count} users." });
        }
    }

    public class BroadcastDto
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Audience { get; set; } = "All Users";
    }
}