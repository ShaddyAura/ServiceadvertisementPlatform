using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ShareLibrary.cs.Data.Seeder
{
        public static class UsersSeeder
        {
            public static async Task SeedAdminAsync(IServiceProvider serviceProvider)
            {
                var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser<Guid>>>();
                var logger = serviceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("UsersSeeder");

                const string adminEmail = "admin@servicead.com";
                const string adminPassword = "Admin@123";

                // Check if admin already exists
                var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
                if (existingAdmin == null)
                {
                    var adminUser = new IdentityUser<Guid>
                    {
                        Id = Guid.NewGuid(),
                        UserName = adminEmail,
                        Email = adminEmail,
                        EmailConfirmed = true
                    };

                    var createResult = await userManager.CreateAsync(adminUser, adminPassword);

                    if (createResult.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                        logger.LogInformation("✅ Admin user created: {Email}", adminEmail);
                    }
                    else
                    {
                        foreach (var error in createResult.Errors)
                        {
                            logger.LogError("❌ Admin creation failed: {Error}", error.Description);
                        }
                    }
                }
                else
                {
                    logger.LogInformation("ℹ️ Admin user already exists: {Email}", adminEmail);
                }
            }
        }

    

}
