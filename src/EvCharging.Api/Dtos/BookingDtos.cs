using System.ComponentModel.DataAnnotations;

namespace EvCharging.Api.Dtos;

public class CreateBookingRequest
{
    [Required]
    public Guid StationId { get; set; }

    [Required]
    public DateOnly BookingDate { get; set; }

    [Required]
    public TimeOnly StartTime { get; set; }

    [Range(15, 480)]
    public int DurationMinutes { get; set; }
}

public class UpdateBookingRequest
{
    [Required]
    public DateOnly BookingDate { get; set; }

    [Required]
    public TimeOnly StartTime { get; set; }

    [Range(15, 480)]
    public int DurationMinutes { get; set; }
}

public class BookingResponse
{
    public Guid Id { get; set; }
    public Guid StationId { get; set; }
    public string StationName { get; set; } = string.Empty;
    public DateOnly BookingDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
}
