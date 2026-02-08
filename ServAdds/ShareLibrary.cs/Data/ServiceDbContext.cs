using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ShareLibrary.cs.Data.Entities;
using ShareLibrary.Data.Entities;

namespace ShareLibrary.cs.Data
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
        public DbSet<UserWallet> Wallets { get; set; }

        public DbSet<ServiceCategory> ServiceCategories { get; set; }
        // -----------------------------
        // Identity & Verification
        // -----------------------------
        public DbSet<DocumentVerified> DocumentVerifieds { get; set; }

        // -----------------------------
        // Services & Listings
        // -----------------------------
        public DbSet<ServiceListings> ServiceListings { get; set; }
        public DbSet<BoostingTransaction> BoostingTransactions { get; set; }

        // -----------------------------
        // Bookings & Communication
        // -----------------------------
        public DbSet<Bookings> Bookings { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // -----------------------------------------------------------
            // Fix Decimal Precision (Required for Migrations)
            // -----------------------------------------------------------
            builder.Entity<ServiceListings>()
                .Property(s => s.Price)
                .HasPrecision(18, 2);

            builder.Entity<UserWallet>()
                .Property(w => w.eSewaBalance)
                .HasPrecision(18, 2);

            builder.Entity<UserWallet>()
                .Property(w => w.KhaltiBalance)
                .HasPrecision(18, 2);

            // -----------------------------------------------------------
            // Profile ↔ Identity User (1–1)
            // -----------------------------------------------------------
            builder.Entity<Profiles>()
                .HasOne<IdentityUser<Guid>>()
                .WithOne()
                .HasForeignKey<Profiles>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // Profile ↔ Wallet (1–1)
            // -----------------------------------------------------------
            builder.Entity<UserWallet>()
                .HasOne(w => w.Profile)
                .WithOne(p => p.Wallet)
                .HasForeignKey<UserWallet>(w => w.ProfileId);

            // -----------------------------------------------------------
            // Profile ↔ ServiceListing (1–Many)
            // -----------------------------------------------------------
            builder.Entity<ServiceListings>()
                .HasOne(s => s.Profile)
                .WithMany(p => p.Services)
                .HasForeignKey(s => s.ProfileId);

            // -----------------------------------------------------------
            // Profile ↔ DocumentVerified (1–Many)
            // -----------------------------------------------------------
            builder.Entity<DocumentVerified>()
                .HasOne(dv => dv.Profile)
                .WithMany(p => p.VerifiedDocuments)
                .HasForeignKey(dv => dv.ProfileId);

            // -----------------------------------------------------------
            // Booking ↔ ServiceListing (NoAction to prevent circular cascade)
            // -----------------------------------------------------------
            builder.Entity<Bookings>()
                .HasOne(b => b.Service)
                .WithMany()
                .HasForeignKey(b => b.ServiceId)
                .OnDelete(DeleteBehavior.NoAction);

            // -----------------------------------------------------------
            // ChatMessage ↔ Booking (1–Many)
            // -----------------------------------------------------------
            builder.Entity<ChatMessage>()
                .HasOne(cm => cm.Booking)
                .WithMany()
                .HasForeignKey(cm => cm.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // BoostingTransaction ↔ ServiceListing
            // -----------------------------------------------------------
            builder.Entity<BoostingTransaction>()
                .HasOne(bt => bt.Service)
                .WithMany()
                .HasForeignKey(bt => bt.ServiceId);
        }
    }
}