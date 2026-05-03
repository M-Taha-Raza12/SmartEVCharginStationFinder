using EvCharging.Api.Data;
using EvCharging.Api.Dtos;
using EvCharging.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvCharging.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AiController(AppDbContext dbContext, AiRecommendationService aiService) : ControllerBase
{
    [HttpPost("recommend")]
    public async Task<ActionResult<AiRecommendationResponse>> Recommend(AiRecommendationRequest request)
    {
        var stations = await dbContext.ChargingStations
            .AsNoTracking()
            .Where(s => s.AvailableSlots > 0)
            .OrderBy(s => s.PricePerKwh)
            .ToListAsync();

        var recommendation = await aiService.RecommendAsync(request, stations);
        return Ok(new AiRecommendationResponse { Recommendation = recommendation });
    }
}
