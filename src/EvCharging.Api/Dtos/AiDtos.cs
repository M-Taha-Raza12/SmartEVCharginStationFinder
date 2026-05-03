using System.ComponentModel.DataAnnotations;

namespace EvCharging.Api.Dtos;

public class AiRecommendationRequest
{
    [Required]
    public string UserLocation { get; set; } = string.Empty;

    [Range(0, 10000)]
    public decimal? Budget { get; set; }

    public string? AdditionalContext { get; set; }
}

public class AiRecommendationResponse
{
    public string Recommendation { get; set; } = string.Empty;
}
