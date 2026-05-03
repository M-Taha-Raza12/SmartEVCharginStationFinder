using EvCharging.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EvCharging.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Check if already seeded
        if (await db.Users.AnyAsync())
        {
            Console.WriteLine("[SEED] Database already seeded, skipping...");
            return;
        }

        Console.WriteLine("[SEED] Seeding database with test data...");

        // Create test users
        var clientUser = new User
        {
            Id = Guid.Parse("1e5a73cc-8cb7-47b6-baac-96f77743d4a0"),
            FullName = "Test Client",
            Email = "client@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Client@123"),
            Role = "Client",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var ownerUser = new User
        {
            Id = Guid.Parse("2f6b84dd-9dc8-58c7-cbbd-a7088854e5b1"),
            FullName = "Test Owner",
            Email = "owner@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner@123"),
            Role = "Owner",
            BusinessName = "EV Charge Co",
            ContactDetails = "+92-300-1234567",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var adminUser = new User
        {
            Id = Guid.Parse("3a7c95ee-aed9-69d8-dcce-b8099965f6c2"),
            FullName = "Super Admin",
            Email = "admin123@gmail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "SuperAdmin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.AddRange(clientUser, ownerUser, adminUser);

        // Create test stations
        var stations = new[]
        {
            new ChargingStation
            {
                Id = Guid.NewGuid(),
                Name = "Clifton EV Hub",
                Address = "Clifton Block 5, Karachi",
                Latitude = 24.8138m,
                Longitude = 67.0299m,
                PricePerKwh = 25.50m,
                TotalSlots = 8,
                AvailableSlots = 5,
                OwnerId = ownerUser.Id,
                IsApproved = true,
                WorkingHoursStart = new TimeSpan(8, 0, 0),
                WorkingHoursEnd = new TimeSpan(22, 0, 0),
                CreatedAt = DateTime.UtcNow
            },
            new ChargingStation
            {
                Id = Guid.NewGuid(),
                Name = "Gulshan Charging Point",
                Address = "Gulshan-e-Iqbal Block 13-D, Karachi",
                Latitude = 24.9207m,
                Longitude = 67.0925m,
                PricePerKwh = 22.00m,
                TotalSlots = 6,
                AvailableSlots = 4,
                OwnerId = ownerUser.Id,
                IsApproved = true,
                WorkingHoursStart = new TimeSpan(7, 0, 0),
                WorkingHoursEnd = new TimeSpan(23, 0, 0),
                CreatedAt = DateTime.UtcNow
            },
            new ChargingStation
            {
                Id = Guid.NewGuid(),
                Name = "DHA Phase 5 Supercharger",
                Address = "DHA Phase 5, Khayaban-e-Mujahid, Karachi",
                Latitude = 24.8155m,
                Longitude = 67.0638m,
                PricePerKwh = 30.00m,
                TotalSlots = 10,
                AvailableSlots = 8,
                OwnerId = ownerUser.Id,
                IsApproved = true,
                WorkingHoursStart = new TimeSpan(0, 0, 0),
                WorkingHoursEnd = new TimeSpan(23, 59, 0),
                CreatedAt = DateTime.UtcNow
            },
            new ChargingStation
            {
                Id = Guid.NewGuid(),
                Name = "Saddar Fast Charge",
                Address = "Saddar Town, Near Empress Market, Karachi",
                Latitude = 24.8546m,
                Longitude = 67.0143m,
                PricePerKwh = 20.00m,
                TotalSlots = 4,
                AvailableSlots = 2,
                OwnerId = ownerUser.Id,
                IsApproved = true,
                WorkingHoursStart = new TimeSpan(9, 0, 0),
                WorkingHoursEnd = new TimeSpan(21, 0, 0),
                CreatedAt = DateTime.UtcNow
            },
            new ChargingStation
            {
                Id = Guid.NewGuid(),
                Name = "Bahria Town EV Station",
                Address = "Bahria Town, Precinct 10, Karachi",
                Latitude = 24.9056m,
                Longitude = 67.1822m,
                PricePerKwh = 28.00m,
                TotalSlots = 12,
                AvailableSlots = 10,
                OwnerId = ownerUser.Id,
                IsApproved = true,
                WorkingHoursStart = new TimeSpan(6, 0, 0),
                WorkingHoursEnd = new TimeSpan(23, 0, 0),
                CreatedAt = DateTime.UtcNow
            }
        };

        db.ChargingStations.AddRange(stations);

        await db.SaveChangesAsync();

        Console.WriteLine($"[SEED] ✅ Seeded {db.Users.Count()} users and {db.ChargingStations.Count()} stations");
    }
}
