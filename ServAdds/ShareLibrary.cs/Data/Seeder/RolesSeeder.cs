using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;


namespace ShareLibrary.cs.Data.Seeder
{
    public static class RolesSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var logger = serviceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("RolesSeeder");

            // Inside RolesSeeder.cs
            var roles = new[] { "Admin", "User", "ServiceProvider" }; 

            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
                    logger.LogInformation("✅ Created role: {Role}", roleName);
                }
                else
                {
                    logger.LogInformation("ℹ️ Role already exists: {Role}", roleName);
                }
            }
        }
    }
}
