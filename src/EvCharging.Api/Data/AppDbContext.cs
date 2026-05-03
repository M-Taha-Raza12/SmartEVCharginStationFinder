using EvCharging.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EvCharging.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<ChargingStation> ChargingStations => Set<ChargingStation>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<WalletTransaction> WalletTransactions => Set<WalletTransaction>();
    public DbSet<ChargingSession> ChargingSessions => Set<ChargingSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Station)
            .WithMany(s => s.Bookings)
            .HasForeignKey(b => b.StationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Station)
            .WithMany(s => s.Reviews)
            .HasForeignKey(r => r.StationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Notification relationships
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Favorite relationships
        modelBuilder.Entity<Favorite>()
            .HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorite>()
            .HasOne(f => f.Station)
            .WithMany()
            .HasForeignKey(f => f.StationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique constraint: one favorite per user per station
        modelBuilder.Entity<Favorite>()
            .HasIndex(f => new { f.UserId, f.StationId })
            .IsUnique();

        // Payment relationships
        modelBuilder.Entity<Payment>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Booking)
            .WithMany()
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Wallet relationships
        modelBuilder.Entity<Wallet>()
            .HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique constraint: one wallet per user
        modelBuilder.Entity<Wallet>()
            .HasIndex(w => w.UserId)
            .IsUnique();

        // Wallet transaction relationships
        modelBuilder.Entity<WalletTransaction>()
            .HasOne(wt => wt.Wallet)
            .WithMany()
            .HasForeignKey(wt => wt.WalletId)
            .OnDelete(DeleteBehavior.Cascade);

        // Charging session relationships
        modelBuilder.Entity<ChargingSession>()
            .HasOne(cs => cs.Booking)
            .WithMany()
            .HasForeignKey(cs => cs.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChargingSession>()
            .HasOne(cs => cs.User)
            .WithMany()
            .HasForeignKey(cs => cs.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChargingSession>()
            .HasOne(cs => cs.Station)
            .WithMany()
            .HasForeignKey(cs => cs.StationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
