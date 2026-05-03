using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using EvCharging.Api.Data;
using EvCharging.Api.Dtos;
using EvCharging.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvCharging.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookingsController(AppDbContext dbContext) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<BookingResponse>> Create(CreateBookingRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        await using var tx = await dbContext.Database.BeginTransactionAsync();

        var rows = await dbContext.Database.ExecuteSqlInterpolatedAsync($@"
UPDATE charging_stations
SET available_slots = available_slots - 1
WHERE id = {request.StationId} AND available_slots > 0
");

        if (rows == 0)
        {
            return BadRequest(new { message = "No slots available for this station." });
        }

        var stationName = await dbContext.ChargingStations
            .AsNoTracking()
            .Where(s => s.Id == request.StationId)
            .Select(s => s.Name)
            .SingleOrDefaultAsync();

        if (string.IsNullOrWhiteSpace(stationName))
        {
            return NotFound(new { message = "Station not found." });
        }

        var booking = new Booking
        {
            UserId = userId,
            StationId = request.StationId,
            BookingDate = request.BookingDate,
            StartTime = request.StartTime,
            DurationMinutes = request.DurationMinutes,
            Status = "confirmed" // Auto-confirm for now, can be changed to "pending" for approval workflow
        };

        dbContext.Bookings.Add(booking);
        await dbContext.SaveChangesAsync();
        await tx.CommitAsync();

        return Ok(new BookingResponse
        {
            Id = booking.Id,
            StationId = booking.StationId,
            StationName = stationName,
            BookingDate = booking.BookingDate,
            StartTime = booking.StartTime,
            DurationMinutes = booking.DurationMinutes,
            Status = booking.Status
        });
    }

    [HttpGet("user")]
    public async Task<ActionResult<IReadOnlyCollection<BookingResponse>>> MyBookings()
    {
        Console.WriteLine("[BOOKINGS] MyBookings endpoint called");
        Console.WriteLine($"[BOOKINGS] User authenticated: {User.Identity?.IsAuthenticated}");
        Console.WriteLine($"[BOOKINGS] User claims count: {User.Claims.Count()}");
        
        foreach (var claim in User.Claims)
        {
            Console.WriteLine($"[BOOKINGS] Claim: {claim.Type} = {claim.Value}");
        }
        
        var userId = GetUserId();
        Console.WriteLine($"[BOOKINGS] Extracted userId: {userId}");
        
        if (userId == Guid.Empty)
        {
            Console.WriteLine("[BOOKINGS] UserId is empty - returning Unauthorized");
            return Unauthorized(new { message = "User ID not found in token" });
        }

        var bookings = await dbContext.Bookings
            .AsNoTracking()
            .Where(b => b.UserId == userId)
            .Join(
                dbContext.ChargingStations,
                b => b.StationId,
                s => s.Id,
                (b, s) => new BookingResponse
                {
                    Id = b.Id,
                    StationId = b.StationId,
                    StationName = s.Name,
                    BookingDate = b.BookingDate,
                    StartTime = b.StartTime,
                    DurationMinutes = b.DurationMinutes,
                    Status = b.Status
                })
            .OrderByDescending(b => b.BookingDate)
            .ThenByDescending(b => b.StartTime)
            .ToListAsync();

        Console.WriteLine($"[BOOKINGS] Found {bookings.Count} bookings for user {userId}");
        return Ok(bookings);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var booking = await dbContext.Bookings.FindAsync(id);
        if (booking is null || booking.UserId != userId)
        {
            return NotFound();
        }

        if (booking.Status == "cancelled")
        {
            return NoContent();
        }

        await using var tx = await dbContext.Database.BeginTransactionAsync();
        booking.Status = "cancelled";
        await dbContext.SaveChangesAsync();

        await dbContext.Database.ExecuteSqlInterpolatedAsync($@"
UPDATE charging_stations
SET available_slots = CASE WHEN available_slots < total_slots THEN available_slots + 1 ELSE available_slots END
WHERE id = {booking.StationId}
");

        await tx.CommitAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BookingResponse>> Update(Guid id, UpdateBookingRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var booking = await dbContext.Bookings.FindAsync(id);
        if (booking is null || booking.UserId != userId)
        {
            return NotFound();
        }

        if (booking.Status != "confirmed")
        {
            return BadRequest(new { message = "Only confirmed bookings can be updated." });
        }

        // Update booking details
        booking.BookingDate = request.BookingDate;
        booking.StartTime = request.StartTime;
        booking.DurationMinutes = request.DurationMinutes;

        await dbContext.SaveChangesAsync();

        var stationName = await dbContext.ChargingStations
            .AsNoTracking()
            .Where(s => s.Id == booking.StationId)
            .Select(s => s.Name)
            .SingleOrDefaultAsync();

        return Ok(new BookingResponse
        {
            Id = booking.Id,
            StationId = booking.StationId,
            StationName = stationName ?? "Unknown Station",
            BookingDate = booking.BookingDate,
            StartTime = booking.StartTime,
            DurationMinutes = booking.DurationMinutes,
            Status = booking.Status
        });
    }

    private Guid GetUserId()
    {
        // Try "sub" claim first (standard JWT claim)
        var sub = User.FindFirstValue("sub");
        if (Guid.TryParse(sub, out var userId))
        {
            return userId;
        }

        // Try ClaimTypes.NameIdentifier (ASP.NET default)
        var nameIdentifier = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(nameIdentifier, out userId))
        {
            return userId;
        }

        // Try JwtRegisteredClaimNames.Sub
        var jwtSub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (Guid.TryParse(jwtSub, out userId))
        {
            return userId;
        }

        return Guid.Empty;
    }
}
