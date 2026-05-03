using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EvCharging.Api.Dtos;
using EvCharging.Api.Models;

namespace EvCharging.Api.Services;

public class AiRecommendationService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
{
    private readonly string? _apiKey = configuration["Groq:ApiKey"];
    private readonly string _model = configuration["Groq:Model"] ?? "openai/gpt-oss-120b";
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;

    public async Task<string> RecommendAsync(AiRecommendationRequest request, IReadOnlyCollection<ChargingStation> stations)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return BuildFallbackRecommendation(request, stations);
        }

        var payload = new
        {
            model = _model,
            messages = new object[]
            {
                new { role = "system", content = "You are an EV charging assistant. Give concise practical recommendation in plain text." },
                new
                {
                    role = "user",
                    content = $"User location: {request.UserLocation}. Budget: {request.Budget?.ToString() ?? "not provided"}. Context: {request.AdditionalContext ?? "none"}. Stations: {JsonSerializer.Serialize(stations.Select(s => new { s.Name, s.Address, s.PricePerKwh, s.AvailableSlots, s.TotalSlots, s.Latitude, s.Longitude }))}"
                }
            },
            temperature = 0.3
        };

        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri("https://api.groq.com/openai/v1/");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        using var response = await client.PostAsync(
            "chat/completions",
            new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

        if (!response.IsSuccessStatusCode)
        {
            return BuildFallbackRecommendation(request, stations);
        }

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var recommendation = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return string.IsNullOrWhiteSpace(recommendation)
            ? BuildFallbackRecommendation(request, stations)
            : recommendation;
    }

    private static string BuildFallbackRecommendation(AiRecommendationRequest request, IReadOnlyCollection<ChargingStation> stations)
    {
        var candidates = stations
            .Where(s => s.AvailableSlots > 0)
            .OrderBy(s => s.PricePerKwh)
            .ThenByDescending(s => s.AvailableSlots)
            .Take(3)
            .ToList();

        if (candidates.Count == 0)
        {
            return "No stations with free slots are available right now. Please try a nearby time window.";
        }

        var best = candidates.First();
        return $"Best option near {request.UserLocation}: {best.Name} ({best.Address ?? "address unavailable"}), Rs {best.PricePerKwh}/kWh with {best.AvailableSlots} slots available.";
    }
}
