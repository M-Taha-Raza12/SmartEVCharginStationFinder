namespace EvCharging.Api.Models;

public class ChargingSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public Guid StationId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public decimal EnergyConsumed { get; set; } = 0; // kWh
    public decimal Cost { get; set; } = 0;
    public string Status { get; set; } = "active"; // active, completed, interrupted
    public int? StartBatteryLevel { get; set; } // percentage
    public int? EndBatteryLevel { get; set; } // percentage
    public decimal? PeakPower { get; set; } // kW
    public decimal? AveragePower { get; set; } // kW
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public Booking? Booking { get; set; }
    public User? User { get; set; }
    public ChargingStation? Station { get; set; }
}
