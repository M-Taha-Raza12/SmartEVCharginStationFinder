using System.Security.Claims;
using EvCharging.Api.Data;
using EvCharging.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvCharging.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentsController(AppDbContext dbContext) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<object>> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        // Verify booking exists and belongs to user
        var booking = await dbContext.Bookings
            .Include(b => b.Station)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId && b.UserId == userId);

        if (booking == null)
        {
            return NotFound(new { message = "Booking not found." });
        }

        // Check if payment already exists
        var existingPayment = await dbContext.Payments
            .FirstOrDefaultAsync(p => p.BookingId == request.BookingId);

        if (existingPayment != null)
        {
            return BadRequest(new { message = "Payment already exists for this booking." });
        }

        // Calculate amount
        var amount = booking.Station!.PricePerKwh * request.EstimatedKwh;

        var payment = new Payment
        {
            UserId = userId,
            BookingId = request.BookingId,
            Amount = amount,
            PaymentMethod = request.PaymentMethod,
            Status = "pending"
        };

        // Process payment based on method
        if (request.PaymentMethod == "wallet")
        {
            var wallet = await dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
            if (wallet == null || wallet.Balance < amount)
            {
                return BadRequest(new { message = "Insufficient wallet balance." });
            }

            // Deduct from wallet
            wallet.Balance -= amount;
            wallet.UpdatedAt = DateTime.UtcNow;

            // Create wallet transaction
            var transaction = new WalletTransaction
            {
                WalletId = wallet.Id,
                Type = "debit",
                Amount = amount,
                BalanceAfter = wallet.Balance,
                Description = $"Payment for booking at {booking.Station.Name}",
                RelatedEntityId = payment.Id,
                RelatedEntityType = "payment"
            };

            dbContext.WalletTransactions.Add(transaction);

            payment.Status = "completed";
            payment.PaidAt = DateTime.UtcNow;
            payment.TransactionId = Guid.NewGuid().ToString();
        }
        else if (request.PaymentMethod == "cash")
        {
            payment.Status = "pending"; // Will be marked completed after charging
        }
        else
        {
            // For card/online payments, would integrate with payment gateway here
            payment.Status = "pending";
            payment.PaymentGateway = request.PaymentMethod;
        }

        dbContext.Payments.Add(payment);
        await dbContext.SaveChangesAsync();

        // Create notification
        await NotificationsController.CreateNotification(
            dbContext,
            userId,
            "Payment Processed",
            $"Payment of Rs {amount:F2} for booking at {booking.Station.Name} has been processed.",
            "success",
            "payment",
            payment.Id
        );

        return Ok(new
        {
            payment.Id,
            payment.Amount,
            payment.Currency,
            payment.PaymentMethod,
            payment.Status,
            payment.TransactionId,
            payment.CreatedAt
        });
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<object>>> GetMyPayments()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var payments = await dbContext.Payments
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .Include(p => p.Booking)
            .ThenInclude(b => b!.Station)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.Amount,
                p.Currency,
                p.PaymentMethod,
                p.Status,
                p.TransactionId,
                p.PaidAt,
                p.CreatedAt,
                Booking = new
                {
                    p.Booking!.Id,
                    p.Booking.BookingDate,
                    p.Booking.StartTime,
                    StationName = p.Booking.Station!.Name
                }
            })
            .ToListAsync();

        return Ok(payments);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<object>> GetPayment(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var payment = await dbContext.Payments
            .AsNoTracking()
            .Where(p => p.Id == id && p.UserId == userId)
            .Include(p => p.Booking)
            .ThenInclude(b => b!.Station)
            .Select(p => new
            {
                p.Id,
                p.Amount,
                p.Currency,
                p.PaymentMethod,
                p.Status,
                p.TransactionId,
                p.PaymentGateway,
                p.PaidAt,
                p.CreatedAt,
                Booking = new
                {
                    p.Booking!.Id,
                    p.Booking.BookingDate,
                    p.Booking.StartTime,
                    p.Booking.DurationMinutes,
                    StationName = p.Booking.Station!.Name,
                    StationAddress = p.Booking.Station.Address
                }
            })
            .FirstOrDefaultAsync();

        if (payment == null)
        {
            return NotFound();
        }

        return Ok(payment);
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var userId) ? userId : Guid.Empty;
    }
}

public class CreatePaymentRequest
{
    public Guid BookingId { get; set; }
    public string PaymentMethod { get; set; } = string.Empty; // wallet, card, cash
    public decimal EstimatedKwh { get; set; } = 10; // Default estimate
}
