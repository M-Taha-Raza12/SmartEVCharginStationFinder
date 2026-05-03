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
public class ReviewsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet("station/{stationId}")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyCollection<object>>> GetStationReviews(Guid stationId)
    {
        var reviews = await dbContext.Reviews
            .AsNoTracking()
            .Where(r => r.StationId == stationId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                UserName = r.User!.FullName
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateReview([FromBody] CreateReviewRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        // Check if user has a completed booking for this station
        var hasBooking = await dbContext.Bookings
            .AnyAsync(b => b.UserId == userId && 
                          b.StationId == request.StationId && 
                          b.Status == "confirmed");

        if (!hasBooking)
        {
            return BadRequest(new { message = "You can only review stations you have booked." });
        }

        // Check if user already reviewed this station
        var existingReview = await dbContext.Reviews
            .FirstOrDefaultAsync(r => r.UserId == userId && r.StationId == request.StationId);

        if (existingReview != null)
        {
            return BadRequest(new { message = "You have already reviewed this station." });
        }

        var review = new Review
        {
            UserId = userId,
            StationId = request.StationId,
            BookingId = request.BookingId,
            Rating = request.Rating,
            Comment = request.Comment
        };

        dbContext.Reviews.Add(review);
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            review.Id,
            review.Rating,
            review.Comment,
            review.CreatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var review = await dbContext.Reviews.FindAsync(id);
        if (review is null)
        {
            return NotFound();
        }

        // Only the review author can delete their review
        if (review.UserId != userId)
        {
            return Forbid();
        }

        dbContext.Reviews.Remove(review);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var userId) ? userId : Guid.Empty;
    }
}

public class CreateReviewRequest
{
    public Guid StationId { get; set; }
    public Guid? BookingId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
