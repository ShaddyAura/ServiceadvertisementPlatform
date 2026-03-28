using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ShareLibrary.cs.Data.Entities;
using System.Reflection.Emit;

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
        // User / Profile / Wallet
        // -----------------------------
        public DbSet<Profiles> Profiles { get; set; }
        public DbSet<UserWallet> Wallets { get; set; }

        // -----------------------------
        // Points & Transactions
        // -----------------------------
        public DbSet<PointsTransaction> PointsTransactions { get; set; }
        public DbSet<BoostingTransaction> BoostingTransactions { get; set; }

        // -----------------------------
        // Gifts & Redemptions
        // -----------------------------
        public DbSet<Gift> Gifts { get; set; }
        public DbSet<RedeemedGift> RedeemedGifts { get; set; }

        // -----------------------------
        // Services & Listings
        // -----------------------------
        public DbSet<ServiceCategory> ServiceCategories { get; set; }
        public DbSet<ServiceListings> ServiceListings { get; set; }
        public DbSet<DocumentVerified> DocumentVerifieds { get; set; }

        public DbSet<Review> Reviews { get; set; }

       

        // -----------------------------
        // Bookings & Communication
        // -----------------------------
        public DbSet<Bookings> Bookings { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        public DbSet<Notification> Notifications { get; set; }

    

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // -----------------------------------------------------------
            // Fix Decimal Precision
            // -----------------------------------------------------------
            builder.Entity<ServiceListings>().Property(s => s.Price).HasPrecision(18, 2);
            builder.Entity<UserWallet>().Property(w => w.ESewaBalance).HasPrecision(18, 2);
            builder.Entity<UserWallet>().Property(w => w.KhaltiBalance).HasPrecision(18, 2);
            
            // Gamification decimals
            builder.Entity<BoostingTransaction>().Property(bt => bt.PointsSpent).HasPrecision(18, 2);
            builder.Entity<Gift>().Property(g => g.PointsRequired).HasPrecision(18, 2);
            builder.Entity<PointsTransaction>().Property(pt => pt.Amount).HasPrecision(18, 2);
            builder.Entity<Profiles>().Property(p => p.BoostingPoints).HasPrecision(18, 2);
            builder.Entity<UserWallet>().Property(w => w.LifetimePurchasedPoints).HasPrecision(18, 2);
            builder.Entity<UserWallet>().Property(w => w.PointsBalance).HasPrecision(18, 2);

            // Fixed the "AgreedPrice" warning here:
            builder.Entity<Bookings>().Property(b => b.AgreedPrice).HasPrecision(18, 2);

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
            // PointsTransaction ↔ Wallet (Many-1)
            // -----------------------------------------------------------
            builder.Entity<PointsTransaction>()
                .HasOne(pt => pt.Wallet)
                .WithMany()
                .HasForeignKey(pt => pt.WalletId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------------------------------------
            // RedeemedGift ↔ Profile & Gift
            // -----------------------------------------------------------
            builder.Entity<RedeemedGift>()
                .HasOne(rg => rg.Gift)
                .WithMany()
                .HasForeignKey(rg => rg.GiftId);

            builder.Entity<RedeemedGift>()
                .HasOne<Profiles>()
                .WithMany()
                .HasForeignKey(rg => rg.ProfileId)
                .OnDelete(DeleteBehavior.NoAction);

            // -----------------------------------------------------------
            // Existing Relationships (Listings, Bookings, Chat)
            // -----------------------------------------------------------
            builder.Entity<ServiceListings>()
                .HasOne(s => s.Profile)
                .WithMany(p => p.Services)
                .HasForeignKey(s => s.ProfileId);

            builder.Entity<Bookings>(entity =>
            {
                entity.HasOne(b => b.Service)
                      .WithMany(s => s.Bookings)
                      .HasForeignKey(b => b.ServiceId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(b => b.Profile)
                      .WithMany(p => p.Bookings)
                      .HasForeignKey(b => b.ProfileId)
                      .OnDelete(DeleteBehavior.NoAction);
            });


            // -----------------------------------------------------------
            // ChatMessage ↔ Booking (Cascade) & Profile (NoAction)
            // -----------------------------------------------------------
            // Configure Sender Relationship
            builder.Entity<ChatMessage>()
                .HasOne(m => m.SenderProfile)
                .WithMany() // Or .WithMany(p => p.SentMessages) if you add that collection to Profiles
                .HasForeignKey(m => m.SenderProfileId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent multiple cascade paths

            // Configure Receiver Relationship
            builder.Entity<ChatMessage>()
                .HasOne(m => m.ReceiverProfile)
                .WithMany() // Or .WithMany(p => p.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverProfileId)
                .OnDelete(DeleteBehavior.Restrict); 

            builder.Entity<BoostingTransaction>()
                .HasOne(bt => bt.Service)
                .WithMany()
                .HasForeignKey(bt => bt.ServiceId);



            // --- Configuration for Review Entity ---
            builder.Entity<Review>(entity =>
            {
                // Primary Key
                entity.HasKey(r => r.Id);

                // Relationship with ServiceListings
                entity.HasOne(r => r.Service)
                    .WithMany() 
                    .HasForeignKey(r => r.ServiceId)
                    .OnDelete(DeleteBehavior.Cascade); 

                // Relationship with Profiles (The Reviewer)
                entity.HasOne(r => r.Profile)
                    .WithMany() 
                    .HasForeignKey(r => r.ProfileId)
                    .OnDelete(DeleteBehavior.Restrict); 

                // Optional: Add constraints for Rating and Comment
                entity.Property(r => r.Rating).IsRequired();
                entity.Property(r => r.Comment).HasMaxLength(1000);

                builder.Entity<Notification>()
                        .HasOne(n => n.Profile)
                        .WithMany()
                        .HasForeignKey(n => n.ProfileId);
            });
        }
    }
}