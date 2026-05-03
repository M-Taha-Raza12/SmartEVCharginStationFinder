namespace EvCharging.Api.Services;

public class JwtSettings
{
    public string Issuer { get; set; } = "evcharging-api";
    public string Audience { get; set; } = "evcharging-client";
    public string Secret { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 120;
}
