using System.Security.Claims;
using EvCharging.Api.Data;
using EvCharging.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvCharging.Api.Controllers;

[Authorize(Roles = "SuperAdmin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController(AppDbContext dbContext) : ControllerBase
{
    // Dashboard Statistics
    [HttpGet("dashboard")]
    public async Task<ActionResult<object>> GetDashboard()
    {
        var totalUsers = await dbContext.Users.CountAsync();
        var totalStations = await dbContext.ChargingStations.CountAsync();
        var totalBookings = await dbContext.Bookings.CountAsync();
        var pendingStations = await dbContext.ChargingStations.CountAsync(s => !s.IsApproved);
        var activeUsers = await dbContext.Users.CountAsync(u => u.IsActive);

        return Ok(new
        {
            totalUsers,
            totalStations,
            totalBookings,
            pendingStations,
            activeUsers,
            totalClients = await dbContext.Users.CountAsync(u => u.Role == "Client"),
            totalOwners = await dbContext.Users.CountAsync(u => u.Role == "Owner")
        });
    }

    // User Management
    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyCollection<object>>> GetAllUsers([FromQuery] string? role)
    {
        var query = dbContext.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(u => u.Role == role);
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.Role,
                u.BusinessName,
                u.ContactDetails,
                u.IsActive,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut("users/{id}/toggle-active")]
    public async Task<IActionResult> ToggleUserActive(Guid id)
    {
        var user = await dbContext.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        if (user.Role == "SuperAdmin")
        {
            return BadRequest(new { message = "Cannot deactivate SuperAdmin users." });
        }

        user.IsActive = !user.IsActive;
        await dbContext.SaveChangesAsync();

        return Ok(new { isActive = user.IsActive });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await dbContext.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        if (user.Role == "SuperAdmin")
        {
            return BadRequest(new { message = "Cannot delete SuperAdmin users." });
        }

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    // Station Approval Management
    [HttpGet("stations/pending")]
    public async Task<ActionResult<IReadOnlyCollection<StationResponse>>> GetPendingStations()
    {
        var stations = await dbContext.ChargingStations
            .AsNoTracking()
            .Where(s => !s.IsApproved)
            .OrderBy(s => s.CreatedAt)
            .Select(s => new StationResponse
            {
                Id = s.Id,
                Name = s.Name,
                Address = s.Address,
                Latitude = s.Latitude,
                Longitude = s.Longitude,
                PricePerKwh = s.PricePerKwh,
                TotalSlots = s.TotalSlots,
                AvailableSlots = s.AvailableSlots,
                OwnerId = s.OwnerId,
                IsApproved = s.IsApproved,
                WorkingHoursStart = s.WorkingHoursStart.HasValue ? s.WorkingHoursStart.Value.ToString(@"hh\:mm") : null,
                WorkingHoursEnd = s.WorkingHoursEnd.HasValue ? s.WorkingHoursEnd.Value.ToString(@"hh\:mm") : null
            })
            .ToListAsync();

        return Ok(stations);
    }

    [HttpPut("stations/{id}/approve")]
    public async Task<IActionResult> ApproveStation(Guid id)
    {
        var station = await dbContext.ChargingStations.FindAsync(id);
        if (station is null)
        {
            return NotFound();
        }

        station.IsApproved = true;
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Station approved successfully." });
    }

    [HttpPut("stations/{id}/reject")]
    public async Task<IActionResult> RejectStation(Guid id)
    {
        var station = await dbContext.ChargingStations.FindAsync(id);
        if (station is null)
        {
            return NotFound();
        }

        dbContext.ChargingStations.Remove(station);
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Station rejected and removed." });
    }

    // All Bookings Monitoring
    [HttpGet("bookings")]
    public async Task<ActionResult<IReadOnlyCollection<object>>> GetAllBookings(
        [FromQuery] string? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var query = dbContext.Bookings
            .AsNoTracking()
            .Include(b => b.User)
            .Include(b => b.Station)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(b => b.Status == status);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(b => b.BookingDate >= DateOnly.FromDateTime(fromDate.Value));
        }

        if (toDate.HasValue)
        {
            query = query.Where(b => b.BookingDate <= DateOnly.FromDateTime(toDate.Value));
        }

        var bookings = await query
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.Id,
                b.BookingDate,
                b.StartTime,
                b.DurationMinutes,
                b.Status,
                b.CreatedAt,
                User = new { b.User!.Id, b.User.FullName, b.User.Email },
                Station = new { b.Station!.Id, b.Station.Name, b.Station.Address }
            })
            .ToListAsync();

        return Ok(bookings);
    }

    // Review Monitoring
    [HttpGet("reviews")]
    public async Task<ActionResult<IReadOnlyCollection<object>>> GetAllReviews()
    {
        var reviews = await dbContext.Reviews
            .AsNoTracking()
            .Include(r => r.User)
            .Include(r => r.Station)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                User = new { r.User!.Id, r.User.FullName, r.User.Email },
                Station = new { r.Station!.Id, r.Station.Name }
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpDelete("reviews/{id}")]
    public async Task<IActionResult> DeleteReview(Guid id)
    {
        var review = await dbContext.Reviews.FindAsync(id);
        if (review is null)
        {
            return NotFound();
        }

        dbContext.Reviews.Remove(review);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}
