using EvCharging.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvCharging.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            var users = await dbContext.Users
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role,
                    u.IsActive,
                    PasswordHashLength = u.PasswordHash.Length,
                    PasswordHashStart = u.PasswordHash.Substring(0, Math.Min(10, u.PasswordHash.Length))
                })
                .ToListAsync();

            return Ok(new
            {
                count = users.Count,
                users
            });
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("db-test")]
    public async Task<IActionResult> TestDatabase()
    {
        try
        {
            var canConnect = await dbContext.Database.CanConnectAsync();
            var isRelational = dbContext.Database.IsRelational();
            var isInMemory = dbContext.Database.IsInMemory();

            return Ok(new
            {
                canConnect,
                isRelational,
                isInMemory,
                providerName = dbContext.Database.ProviderName
            });
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    [HttpPost("clear-users")]
    public async Task<IActionResult> ClearUsers()
    {
        try
        {
            var users = await dbContext.Users.ToListAsync();
            dbContext.Users.RemoveRange(users);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = $"Deleted {users.Count} users" });
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    [HttpPost("test-login")]
    public async Task<IActionResult> TestLogin([FromBody] TestLoginRequest request)
    {
        try
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var user = await dbContext.Users.SingleOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return Ok(new
                {
                    success = false,
                    message = "User not found",
                    emailSearched = email
                });
            }

            var passwordMatches = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            return Ok(new
            {
                success = passwordMatches,
                message = passwordMatches ? "Password matches!" : "Password does not match",
                userFound = true,
                userId = user.Id,
                userEmail = user.Email,
                userRole = user.Role,
                passwordHashStart = user.PasswordHash.Substring(0, 10)
            });
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                success = false,
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    [HttpPost("seed-karachi-stations")]
    public async Task<IActionResult> SeedKarachiStations()
    {
        try
        {
            // Check if stations already exist
            var existingCount = await dbContext.ChargingStations
                .CountAsync(s => s.Address != null && s.Address.Contains("Karachi"));

            if (existingCount >= 15)
            {
                return Ok(new
                {
                    success = false,
                    message = $"Karachi stations already exist ({existingCount} found). Skipping seed.",
                    existingCount
                });
            }

            var stations = new[]
            {
                new { Name = "Clifton Beach Charging Hub", Address = "Sea View, Clifton Block 8, Karachi", Lat = 24.8138m, Lng = 67.0299m, Price = 12.50m, Slots = 15, Start = "06:00", End = "23:00" },
                new { Name = "Saddar Express Charge", Address = "Empress Market, Saddar Town, Karachi", Lat = 24.8607m, Lng = 67.0099m, Price = 10.00m, Slots = 8, Start = "07:00", End = "22:00" },
                new { Name = "Gulshan-e-Iqbal Power Station", Address = "Block 13-D, Gulshan-e-Iqbal, Karachi", Lat = 24.9207m, Lng = 67.0927m, Price = 11.00m, Slots = 12, Start = "08:00", End = "20:00" },
                new { Name = "DHA Phase 5 EV Hub", Address = "Khayaban-e-Mujahid, DHA Phase 5, Karachi", Lat = 24.8103m, Lng = 67.0589m, Price = 15.00m, Slots = 20, Start = "00:00", End = "23:59" },
                new { Name = "Malir Cantt Quick Charge", Address = "Malir Cantonment, Karachi", Lat = 24.9436m, Lng = 67.2060m, Price = 9.50m, Slots = 10, Start = "06:00", End = "22:00" },
                new { Name = "Korangi Industrial Charging Point", Address = "Korangi Industrial Area, Karachi", Lat = 24.8607m, Lng = 67.1011m, Price = 8.50m, Slots = 25, Start = "00:00", End = "23:59" },
                new { Name = "Bahria Town EV Station", Address = "Precinct 10, Bahria Town, Karachi", Lat = 24.9056m, Lng = 67.1878m, Price = 13.00m, Slots = 18, Start = "07:00", End = "23:00" },
                new { Name = "North Nazimabad Charge Hub", Address = "Block L, North Nazimabad, Karachi", Lat = 24.9270m, Lng = 67.0333m, Price = 10.50m, Slots = 14, Start = "08:00", End = "21:00" },
                new { Name = "Tariq Road Shopping District Charger", Address = "Tariq Road, PECHS, Karachi", Lat = 24.8700m, Lng = 67.0600m, Price = 12.00m, Slots = 10, Start = "09:00", End = "23:00" },
                new { Name = "Karachi Airport EV Parking", Address = "Jinnah International Airport, Karachi", Lat = 24.9065m, Lng = 67.1608m, Price = 16.00m, Slots = 30, Start = "00:00", End = "23:59" },
                new { Name = "Clifton Cantonment Fast Charge", Address = "Khayaban-e-Rahat, Clifton Cantt, Karachi", Lat = 24.8256m, Lng = 67.0363m, Price = 14.00m, Slots = 12, Start = "07:00", End = "22:00" },
                new { Name = "Shahrah-e-Faisal Business Hub Charger", Address = "Shahrah-e-Faisal, Near Metropole Hotel, Karachi", Lat = 24.8700m, Lng = 67.0700m, Price = 11.50m, Slots = 16, Start = "06:00", End = "23:00" },
                new { Name = "Lyari Express Charging", Address = "Lyari Expressway, Karachi", Lat = 24.8700m, Lng = 66.9900m, Price = 9.00m, Slots = 8, Start = "07:00", End = "21:00" },
                new { Name = "Port Qasim Industrial Charger", Address = "Port Qasim Authority, Karachi", Lat = 24.7833m, Lng = 67.3500m, Price = 10.00m, Slots = 22, Start = "00:00", End = "23:59" },
                new { Name = "Scheme 33 Residential Charging", Address = "Scheme 33, Gulzar-e-Hijri, Karachi", Lat = 24.9300m, Lng = 67.1100m, Price = 11.00m, Slots = 10, Start = "08:00", End = "20:00" }
            };

            var stationEntities = stations.Select(s => new Models.ChargingStation
            {
                Name = s.Name,
                Address = s.Address,
                Latitude = s.Lat,
                Longitude = s.Lng,
                PricePerKwh = s.Price,
                TotalSlots = s.Slots,
                AvailableSlots = s.Slots,
                OwnerId = null,
                IsApproved = true,
                WorkingHoursStart = TimeSpan.Parse(s.Start),
                WorkingHoursEnd = TimeSpan.Parse(s.End)
            }).ToList();

            await dbContext.ChargingStations.AddRangeAsync(stationEntities);
            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Successfully added {stationEntities.Count} charging stations in Karachi!",
                stationsAdded = stationEntities.Count,
                stations = stationEntities.Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Address,
                    s.Latitude,
                    s.Longitude,
                    s.PricePerKwh,
                    s.TotalSlots
                })
            });
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                success = false,
                error = ex.Message,
                innerError = ex.InnerException?.Message,
                stackTrace = ex.StackTrace
            });
        }
    }
}

public class TestLoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
