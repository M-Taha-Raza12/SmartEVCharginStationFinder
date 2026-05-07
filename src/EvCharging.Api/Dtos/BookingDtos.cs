using System.ComponentModel.DataAnnotations;

namespace EvCharging.Api.Dtos;

public class CreateBookingRequest
{
    [Required]
    public Guid StationId { get; set; }

    [Required]
    public string BookingDate { get; set; } = string.Empty; // Format: "YYYY-MM-DD"

    [Required]
    public string StartTime { get; set; } = string.Empty; // Format: "HH:mm"

    [Range(15, 480)]
    public int DurationMinutes { get; set; }
}

public class UpdateBookingRequest
{
    [Required]
    public string BookingDate { get; set; } = string.Empty; // Format: "YYYY-MM-DD"

    [Required]
    public string StartTime { get; set; } = string.Empty; // Format: "HH:mm"

    [Range(15, 480)]
    public int DurationMinutes { get; set; }
}

public class BookingResponse
{
    public Guid Id { get; set; }
    public Guid StationId { get; set; }
    public string StationName { get; set; } = string.Empty;
    public string BookingDate { get; set; } = string.Empty; // Format: "YYYY-MM-DD"
    public string StartTime { get; set; } = string.Empty; // Format: "HH:mm"
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
}
