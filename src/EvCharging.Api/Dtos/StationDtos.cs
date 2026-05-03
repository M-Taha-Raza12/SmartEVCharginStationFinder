using System.ComponentModel.DataAnnotations;

namespace EvCharging.Api.Dtos;

public class StationRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Address { get; set; }

    [Range(-90, 90)]
    public decimal Latitude { get; set; }

    [Range(-180, 180)]
    public decimal Longitude { get; set; }

    [Range(0, 10000)]
    public decimal PricePerKwh { get; set; }

    [Range(1, 500)]
    public int TotalSlots { get; set; }

    [Range(0, 500)]
    public int AvailableSlots { get; set; }

    public string? WorkingHoursStart { get; set; }
    public string? WorkingHoursEnd { get; set; }
}

public class StationResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal PricePerKwh { get; set; }
    public int TotalSlots { get; set; }
    public int AvailableSlots { get; set; }
    public Guid? OwnerId { get; set; }
    public bool IsApproved { get; set; }
    public string? WorkingHoursStart { get; set; }
    public string? WorkingHoursEnd { get; set; }
    public double? AverageRating { get; set; }
    public int ReviewCount { get; set; }
}
