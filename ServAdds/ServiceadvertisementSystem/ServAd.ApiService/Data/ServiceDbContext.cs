using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Data.Entities;
using ServAd.UserDashboard.Entities;

namespace ServAd.ApiService.Data
{
    public class ServiceDbContext
        : IdentityDbContext<IdentityUser<Guid>, IdentityRole<Guid>, Guid>
    {
        public ServiceDbContext(DbContextOptions<ServiceDbContext> options)
            : base(options)
        {
        }

        // -----------------------------
        // User / Profile
        // -----------------------------
        public DbSet<Profiles> Profiles { get; set; }

        // -----------------------------
        // Identity & Verification
        // -----------------------------
        public DbSet<VerificationDocument> VerificationDocuments { get; set; }

        // -----------------------------
        // Services & Listings
        // -----------------------------
        public DbSet<Service> Services { get; set; }
        public DbSet<ServiceMedia> ServiceMedias { get; set; }
        public DbSet<Availability> Availabilities { get; set; }

        // -----------------------------
        // Bookings & Payments
        // -----------------------------
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }

        // -----------------------------
        // Reviews & Reputation
        // -----------------------------
        public DbSet<Review> Reviews { get; set; }

        // -----------------------------
        // Communication
        // -----------------------------
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // -----------------------------
            // Profile ↔ Identity User (1–1)
            // -----------------------------
            builder.Entity<Profiles>()
                .HasOne<IdentityUser<Guid>>()
                .WithOne()
                .HasForeignKey<Profiles>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // Service ↔ Media (1–Many)
            // -----------------------------
            builder.Entity<ServiceMedia>()
                .HasOne<Service>()
                .WithMany()
                .HasForeignKey(sm => sm.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // Service ↔ Availability (1–Many)
            // -----------------------------
            builder.Entity<Availability>()
                .HasOne<Service>()
                .WithMany()
                .HasForeignKey(a => a.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // Booking ↔ Service
            // -----------------------------
            builder.Entity<Booking>()
                .HasOne<Service>()
                .WithMany()
                .HasForeignKey(b => b.ServiceId);

            // -----------------------------
            // Payment ↔ Booking (1–1)
            // -----------------------------
            builder.Entity<Payment>()
                .HasOne<Booking>()
                .WithMany()
                .HasForeignKey(p => p.BookingId);

            // -----------------------------
            // Review ↔ Booking
            // -----------------------------
            builder.Entity<Review>()
                .HasOne<Booking>()
                .WithMany()
                .HasForeignKey(r => r.BookingId);
        }
    }
}
