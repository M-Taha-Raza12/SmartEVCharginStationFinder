using System.Security.Claims;
using EvCharging.Api.Data;
using EvCharging.Api.Dtos;
using EvCharging.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvCharging.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StationsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<StationResponse>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool? availableOnly)
    {
        var query = dbContext.ChargingStations.AsNoTracking().AsQueryable();

        // Only show approved stations to non-admin users
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "SuperAdmin")
        {
            query = query.Where(s => s.IsApproved);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim().ToLower();
            query = query.Where(s =>
                s.Name.ToLower().Contains(keyword) ||
                (s.Address != null && s.Address.ToLower().Contains(keyword)));
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(s => s.PricePerKwh <= maxPrice.Value);
        }

        if (availableOnly == true)
        {
            query = query.Where(s => s.AvailableSlots > 0);
        }

        var data = await query
            .OrderBy(s => s.Name)
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
                WorkingHoursEnd = s.WorkingHoursEnd.HasValue ? s.WorkingHoursEnd.Value.ToString(@"hh\:mm") : null,
                AverageRating = s.Reviews.Any() ? s.Reviews.Average(r => (double)r.Rating) : null,
                ReviewCount = s.Reviews.Count
            })
            .ToListAsync();

        return Ok(data);
    }

    [Authorize(Roles = "SuperAdmin,Owner")]
    [HttpPost]
    public async Task<ActionResult<StationResponse>> Create(StationRequest request)
    {
        if (request.AvailableSlots > request.TotalSlots)
        {
            return BadRequest(new { message = "Available slots cannot exceed total slots." });
        }

        var userId = Guid.Parse(User.FindFirstValue("sub") ?? Guid.Empty.ToString());
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        var station = new ChargingStation
        {
            Name = request.Name.Trim(),
            Address = request.Address?.Trim(),
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            PricePerKwh = request.PricePerKwh,
            TotalSlots = request.TotalSlots,
            AvailableSlots = request.AvailableSlots,
            OwnerId = userRole == "SuperAdmin" ? null : userId,
            IsApproved = userRole == "SuperAdmin", // SuperAdmin stations are auto-approved
            WorkingHoursStart = !string.IsNullOrWhiteSpace(request.WorkingHoursStart) ? TimeSpan.Parse(request.WorkingHoursStart) : null,
            WorkingHoursEnd = !string.IsNullOrWhiteSpace(request.WorkingHoursEnd) ? TimeSpan.Parse(request.WorkingHoursEnd) : null
        };

        dbContext.ChargingStations.Add(station);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = station.Id }, new StationResponse
        {
            Id = station.Id,
            Name = station.Name,
            Address = station.Address,
            Latitude = station.Latitude,
            Longitude = station.Longitude,
            PricePerKwh = station.PricePerKwh,
            TotalSlots = station.TotalSlots,
            AvailableSlots = station.AvailableSlots,
            OwnerId = station.OwnerId,
            IsApproved = station.IsApproved,
            WorkingHoursStart = station.WorkingHoursStart?.ToString(@"hh\:mm"),
            WorkingHoursEnd = station.WorkingHoursEnd?.ToString(@"hh\:mm")
        });
    }

    [Authorize(Roles = "SuperAdmin,Owner")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<StationResponse>> Update(Guid id, StationRequest request)
    {
        var station = await dbContext.ChargingStations.FindAsync(id);
        if (station is null)
        {
            return NotFound();
        }

        var userId = Guid.Parse(User.FindFirstValue("sub") ?? Guid.Empty.ToString());
        if (!User.IsInRole("SuperAdmin") && station.OwnerId != userId)
        {
            return Forbid();
        }

        if (request.AvailableSlots > request.TotalSlots)
        {
            return BadRequest(new { message = "Available slots cannot exceed total slots." });
        }

        station.Name = request.Name.Trim();
        station.Address = request.Address?.Trim();
        station.Latitude = request.Latitude;
        station.Longitude = request.Longitude;
        station.PricePerKwh = request.PricePerKwh;
        station.TotalSlots = request.TotalSlots;
        station.AvailableSlots = request.AvailableSlots;
        station.WorkingHoursStart = !string.IsNullOrWhiteSpace(request.WorkingHoursStart) ? TimeSpan.Parse(request.WorkingHoursStart) : null;
        station.WorkingHoursEnd = !string.IsNullOrWhiteSpace(request.WorkingHoursEnd) ? TimeSpan.Parse(request.WorkingHoursEnd) : null;

        await dbContext.SaveChangesAsync();

        return Ok(new StationResponse
        {
            Id = station.Id,
            Name = station.Name,
            Address = station.Address,
            Latitude = station.Latitude,
            Longitude = station.Longitude,
            PricePerKwh = station.PricePerKwh,
            TotalSlots = station.TotalSlots,
            AvailableSlots = station.AvailableSlots,
            OwnerId = station.OwnerId,
            IsApproved = station.IsApproved,
            WorkingHoursStart = station.WorkingHoursStart?.ToString(@"hh\:mm"),
            WorkingHoursEnd = station.WorkingHoursEnd?.ToString(@"hh\:mm")
        });
    }

    [Authorize(Roles = "SuperAdmin,Owner")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var station = await dbContext.ChargingStations.FindAsync(id);
        if (station is null)
        {
            return NotFound();
        }

        var userId = Guid.Parse(User.FindFirstValue("sub") ?? Guid.Empty.ToString());
        if (!User.IsInRole("SuperAdmin") && station.OwnerId != userId)
        {
            return Forbid();
        }

        dbContext.ChargingStations.Remove(station);
        await dbContext.SaveChangesAsync();
        return NoContent();
    }

    // Get stations owned by current user (for Owner role)
    [Authorize(Roles = "Owner")]
    [HttpGet("my-stations")]
    public async Task<ActionResult<IReadOnlyCollection<StationResponse>>> GetMyStations()
    {
        var userId = Guid.Parse(User.FindFirstValue("sub") ?? Guid.Empty.ToString());

        var stations = await dbContext.ChargingStations
            .AsNoTracking()
            .Where(s => s.OwnerId == userId)
            .OrderBy(s => s.Name)
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
                WorkingHoursEnd = s.WorkingHoursEnd.HasValue ? s.WorkingHoursEnd.Value.ToString(@"hh\:mm") : null,
                AverageRating = s.Reviews.Any() ? s.Reviews.Average(r => (double)r.Rating) : null,
                ReviewCount = s.Reviews.Count
            })
            .ToListAsync();

        return Ok(stations);
    }

    // Get bookings for owner's stations
    [Authorize(Roles = "Owner")]
    [HttpGet("my-stations/bookings")]
    public async Task<ActionResult<IReadOnlyCollection<object>>> GetMyStationsBookings()
    {
        var userId = Guid.Parse(User.FindFirstValue("sub") ?? Guid.Empty.ToString());

        var bookings = await dbContext.Bookings
            .AsNoTracking()
            .Include(b => b.User)
            .Include(b => b.Station)
            .Where(b => b.Station!.OwnerId == userId)
            .OrderByDescending(b => b.BookingDate)
            .ThenByDescending(b => b.StartTime)
            .Select(b => new
            {
                b.Id,
                b.BookingDate,
                b.StartTime,
                b.DurationMinutes,
                b.Status,
                b.CreatedAt,
                StationName = b.Station!.Name,
                UserName = b.User!.FullName,
                UserEmail = b.User.Email
            })
            .ToListAsync();

        return Ok(bookings);
    }
}
