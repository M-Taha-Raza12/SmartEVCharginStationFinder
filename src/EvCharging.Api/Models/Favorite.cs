namespace EvCharging.Api.Models;

public class Favorite
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid StationId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public User? User { get; set; }
    public ChargingStation? Station { get; set; }
}
