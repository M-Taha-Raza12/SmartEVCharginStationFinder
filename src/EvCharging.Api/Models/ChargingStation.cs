using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EvCharging.Api.Models;

[Table("charging_stations")]
public class ChargingStation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("address")]
    public string? Address { get; set; }

    [Column("latitude")]
    public decimal Latitude { get; set; }

    [Column("longitude")]
    public decimal Longitude { get; set; }

    [Column("price_per_kwh")]
    public decimal PricePerKwh { get; set; }

    [Column("total_slots")]
    public int TotalSlots { get; set; }

    [Column("available_slots")]
    public int AvailableSlots { get; set; }

    [Column("owner_id")]
    public Guid? OwnerId { get; set; }

    [Column("is_approved")]
    public bool IsApproved { get; set; } = false;

    [Column("working_hours_start")]
    public TimeSpan? WorkingHoursStart { get; set; }

    [Column("working_hours_end")]
    public TimeSpan? WorkingHoursEnd { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
