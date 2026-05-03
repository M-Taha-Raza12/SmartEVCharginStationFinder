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
public class FavoritesController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<object>>> GetMyFavorites()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var favorites = await dbContext.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == userId)
            .Include(f => f.Station)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new
            {
                f.Id,
                f.StationId,
                f.CreatedAt,
                Station = new
                {
                    f.Station!.Id,
                    f.Station.Name,
                    f.Station.Address,
                    f.Station.Latitude,
                    f.Station.Longitude,
                    f.Station.PricePerKwh,
                    f.Station.TotalSlots,
                    f.Station.AvailableSlots,
                    f.Station.IsApproved,
                    f.Station.WorkingHoursStart,
                    f.Station.WorkingHoursEnd,
                    AverageRating = f.Station.Reviews.Any() ? f.Station.Reviews.Average(r => (double)r.Rating) : (double?)null,
                    ReviewCount = f.Station.Reviews.Count
                }
            })
            .ToListAsync();

        return Ok(favorites);
    }

    [HttpPost]
    public async Task<ActionResult<object>> AddFavorite([FromBody] AddFavoriteRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        // Check if station exists
        var stationExists = await dbContext.ChargingStations
            .AnyAsync(s => s.Id == request.StationId);

        if (!stationExists)
        {
            return NotFound(new { message = "Station not found." });
        }

        // Check if already favorited
        var existingFavorite = await dbContext.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.StationId == request.StationId);

        if (existingFavorite != null)
        {
            return BadRequest(new { message = "Station is already in your favorites." });
        }

        var favorite = new Favorite
        {
            UserId = userId,
            StationId = request.StationId
        };

        dbContext.Favorites.Add(favorite);
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            favorite.Id,
            favorite.StationId,
            favorite.CreatedAt,
            message = "Station added to favorites!"
        });
    }

    [HttpDelete("{stationId:guid}")]
    public async Task<IActionResult> RemoveFavorite(Guid stationId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var favorite = await dbContext.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.StationId == stationId);

        if (favorite == null)
        {
            return NotFound(new { message = "Favorite not found." });
        }

        dbContext.Favorites.Remove(favorite);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("check/{stationId:guid}")]
    public async Task<ActionResult<object>> CheckFavorite(Guid stationId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var isFavorite = await dbContext.Favorites
            .AnyAsync(f => f.UserId == userId && f.StationId == stationId);

        return Ok(new { isFavorite });
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var userId) ? userId : Guid.Empty;
    }
}

public class AddFavoriteRequest
{
    public Guid StationId { get; set; }
}
