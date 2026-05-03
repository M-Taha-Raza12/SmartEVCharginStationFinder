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
public class WalletsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> GetMyWallet()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var wallet = await dbContext.Wallets
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
        {
            // Create wallet if doesn't exist
            wallet = new Wallet
            {
                UserId = userId,
                Balance = 0,
                Currency = "PKR"
            };

            dbContext.Wallets.Add(wallet);
            await dbContext.SaveChangesAsync();
        }

        return Ok(new
        {
            wallet.Id,
            wallet.Balance,
            wallet.Currency,
            wallet.UpdatedAt
        });
    }

    [HttpPost("topup")]
    public async Task<ActionResult<object>> TopUp([FromBody] TopUpRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        if (request.Amount <= 0)
        {
            return BadRequest(new { message = "Amount must be greater than zero." });
        }

        var wallet = await dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
        {
            wallet = new Wallet
            {
                UserId = userId,
                Balance = 0,
                Currency = "PKR"
            };
            dbContext.Wallets.Add(wallet);
        }

        // Add amount to wallet
        wallet.Balance += request.Amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        // Create transaction record
        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            Type = "credit",
            Amount = request.Amount,
            BalanceAfter = wallet.Balance,
            Description = $"Wallet top-up via {request.PaymentMethod}",
            RelatedEntityType = "topup"
        };

        dbContext.WalletTransactions.Add(transaction);
        await dbContext.SaveChangesAsync();

        // Create notification
        await NotificationsController.CreateNotification(
            dbContext,
            userId,
            "Wallet Topped Up",
            $"Your wallet has been credited with Rs {request.Amount:F2}. New balance: Rs {wallet.Balance:F2}",
            "success",
            "wallet",
            wallet.Id
        );

        return Ok(new
        {
            WalletId = wallet.Id,
            wallet.Balance,
            wallet.Currency,
            TransactionId = transaction.Id,
            message = "Wallet topped up successfully!"
        });
    }

    [HttpGet("transactions")]
    public async Task<ActionResult<IReadOnlyCollection<object>>> GetTransactions()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var wallet = await dbContext.Wallets
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
        {
            return Ok(new List<object>());
        }

        var transactions = await dbContext.WalletTransactions
            .AsNoTracking()
            .Where(wt => wt.WalletId == wallet.Id)
            .OrderByDescending(wt => wt.CreatedAt)
            .Select(wt => new
            {
                wt.Id,
                wt.Type,
                wt.Amount,
                wt.BalanceAfter,
                wt.Description,
                wt.RelatedEntityType,
                wt.RelatedEntityId,
                wt.CreatedAt
            })
            .ToListAsync();

        return Ok(transactions);
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var userId) ? userId : Guid.Empty;
    }
}

public class TopUpRequest
{
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "card"; // card, bank_transfer, etc.
}
