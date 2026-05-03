using System.Security.Claims;
using EvCharging.Api.Data;
using EvCharging.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvCharging.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChargingSessionsController(AppDbContext dbContext) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<object>> StartSession([FromBody] StartSessionRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        // Verify booking exists and belongs to user
        var booking = await dbContext.Bookings
            .Include(b => b.Station)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId && b.UserId == userId);

        if (booking == null)
        {
            return NotFound(new { message = "Booking not found." });
        }

        // Check if session already exists
        var existingSession = await dbContext.ChargingSessions
            .FirstOrDefaultAsync(cs => cs.BookingId == request.BookingId && cs.Status == "active");

        if (existingSession != null)
        {
            return BadRequest(new { message = "An active charging session already exists for this booking." });
        }

        var session = new ChargingSession
        {
            BookingId = request.BookingId,
            UserId = userId,
            StationId = booking.StationId,
            StartTime = DateTime.UtcNow,
            StartBatteryLevel = request.StartBatteryLevel,
            Status = "active"
        };

        dbContext.ChargingSessions.Add(session);
        await dbContext.SaveChangesAsync();

        // Create notification
        await NotificationsController.CreateNotification(
            dbContext,
            userId,
            "Charging Started",
            $"Charging session started at {booking.Station!.Name}",
            "info",
            "charging_session",
            session.Id
        );

        return Ok(new
        {
            session.Id,
            session.BookingId,
            session.StartTime,
            session.StartBatteryLevel,
            session.Status,
            StationName = booking.Station.Name
        });
    }

    [HttpPut("{id:guid}/end")]
    public async Task<ActionResult<object>> EndSession(Guid id, [FromBody] EndSessionRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var session = await dbContext.ChargingSessions
            .Include(cs => cs.Station)
            .FirstOrDefaultAsync(cs => cs.Id == id && cs.UserId == userId);

        if (session == null)
        {
            return NotFound(new { message = "Charging session not found." });
        }

        if (session.Status != "active")
        {
            return BadRequest(new { message = "Session is not active." });
        }

        session.EndTime = DateTime.UtcNow;
        session.EndBatteryLevel = request.EndBatteryLevel;
        session.EnergyConsumed = request.EnergyConsumed;
        session.Cost = session.EnergyConsumed * session.Station!.PricePerKwh;
        session.Status = "completed";
        session.AveragePower = request.AveragePower;
        session.PeakPower = request.PeakPower;

        await dbContext.SaveChangesAsync();

        // Create notification
        await NotificationsController.CreateNotification(
            dbContext,
            userId,
            "Charging Completed",
            $"Charging session completed. Energy consumed: {session.EnergyConsumed:F2} kWh, Cost: Rs {session.Cost:F2}",
            "success",
            "charging_session",
            session.Id
        );

        return Ok(new
        {
            session.Id,
            session.StartTime,
            session.EndTime,
            session.EnergyConsumed,
            session.Cost,
            session.StartBatteryLevel,
            session.EndBatteryLevel,
            session.Status,
            Duration = (session.EndTime - session.StartTime)?.TotalMinutes
        });
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<object>>> GetMySessions()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var sessions = await dbContext.ChargingSessions
            .AsNoTracking()
            .Where(cs => cs.UserId == userId)
            .Include(cs => cs.Station)
            .OrderByDescending(cs => cs.StartTime)
            .Select(cs => new
            {
                cs.Id,
                cs.StartTime,
                cs.EndTime,
                cs.EnergyConsumed,
                cs.Cost,
                cs.Status,
                cs.StartBatteryLevel,
                cs.EndBatteryLevel,
                cs.PeakPower,
                cs.AveragePower,
                Station = new
                {
                    cs.Station!.Id,
                    cs.Station.Name,
                    cs.Station.Address
                },
                Duration = cs.EndTime != null ? (cs.EndTime - cs.StartTime).Value.TotalMinutes : (double?)null
            })
            .ToListAsync();

        return Ok(sessions);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<object>> GetSession(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var session = await dbContext.ChargingSessions
            .AsNoTracking()
            .Where(cs => cs.Id == id && cs.UserId == userId)
            .Include(cs => cs.Station)
            .Include(cs => cs.Booking)
            .Select(cs => new
            {
                cs.Id,
                cs.StartTime,
                cs.EndTime,
                cs.EnergyConsumed,
                cs.Cost,
                cs.Status,
                cs.StartBatteryLevel,
                cs.EndBatteryLevel,
                cs.PeakPower,
                cs.AveragePower,
                Station = new
                {
                    cs.Station!.Id,
                    cs.Station.Name,
                    cs.Station.Address,
                    cs.Station.PricePerKwh
                },
                Booking = new
                {
                    cs.Booking!.Id,
                    cs.Booking.BookingDate,
                    cs.Booking.StartTime
                },
                Duration = cs.EndTime != null ? (cs.EndTime - cs.StartTime).Value.TotalMinutes : (double?)null
            })
            .FirstOrDefaultAsync();

        if (session == null)
        {
            return NotFound();
        }

        return Ok(session);
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<object>> GetAnalytics([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var query = dbContext.ChargingSessions
            .AsNoTracking()
            .Where(cs => cs.UserId == userId && cs.Status == "completed");

        if (fromDate.HasValue)
        {
            query = query.Where(cs => cs.StartTime >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(cs => cs.StartTime <= toDate.Value);
        }

        var sessions = await query.ToListAsync();

        var analytics = new
        {
            TotalSessions = sessions.Count,
            TotalEnergyConsumed = sessions.Sum(cs => cs.EnergyConsumed),
            TotalCost = sessions.Sum(cs => cs.Cost),
            AverageEnergyPerSession = sessions.Any() ? sessions.Average(cs => cs.EnergyConsumed) : 0,
            AverageCostPerSession = sessions.Any() ? sessions.Average(cs => cs.Cost) : 0,
            TotalDuration = sessions.Sum(cs => cs.EndTime != null ? (cs.EndTime - cs.StartTime).Value.TotalMinutes : 0),
            MostUsedStation = sessions
                .GroupBy(cs => new { cs.StationId, cs.Station!.Name })
                .OrderByDescending(g => g.Count())
                .Select(g => new { g.Key.StationId, g.Key.Name, Count = g.Count() })
                .FirstOrDefault(),
            MonthlyBreakdown = sessions
                .GroupBy(cs => new { cs.StartTime.Year, cs.StartTime.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Sessions = g.Count(),
                    EnergyConsumed = g.Sum(cs => cs.EnergyConsumed),
                    Cost = g.Sum(cs => cs.Cost)
                })
                .OrderByDescending(g => g.Year)
                .ThenByDescending(g => g.Month)
                .ToList()
        };

        return Ok(analytics);
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var userId) ? userId : Guid.Empty;
    }
}

public class StartSessionRequest
{
    public Guid BookingId { get; set; }
    public int? StartBatteryLevel { get; set; }
}

public class EndSessionRequest
{
    public int? EndBatteryLevel { get; set; }
    public decimal EnergyConsumed { get; set; }
    public decimal? PeakPower { get; set; }
    public decimal? AveragePower { get; set; }
}
