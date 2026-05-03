using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EvCharging.Api.Models;

[Table("bookings")]
public class Booking
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("station_id")]
    public Guid StationId { get; set; }

    [Column("booking_date")]
    public DateOnly BookingDate { get; set; }

    [Column("start_time")]
    public TimeOnly StartTime { get; set; }

    [Column("duration_minutes")]
    public int DurationMinutes { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "confirmed";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ChargingStation? Station { get; set; }
}
