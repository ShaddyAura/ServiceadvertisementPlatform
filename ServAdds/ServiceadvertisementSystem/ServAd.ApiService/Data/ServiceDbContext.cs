using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ServAd.ApiService.Data.Entities;
using ServAd.UserDashboard.Entities;


namespace ServAd.ApiService.Data
{
    public class ServiceDbContext : IdentityDbContext<IdentityUser<Guid>, IdentityRole<Guid>, Guid>
    {
        public ServiceDbContext(DbContextOptions<ServiceDbContext> options)
            : base(options)
        {
        }

        // Use correct entity name: Profiles
        public DbSet<Profiles> Profiles { get; set; }
        public DbSet<VerificationDocument> VerificationDocuments { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Profiles>()
                .HasOne<IdentityUser<Guid>>()        
                .WithOne()
                .HasForeignKey<Profiles>(p => p.UserId);
        }
    }
}
