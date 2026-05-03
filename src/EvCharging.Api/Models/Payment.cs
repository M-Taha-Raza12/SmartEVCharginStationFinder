namespace EvCharging.Api.Models;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid BookingId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "PKR";
    public string PaymentMethod { get; set; } = string.Empty; // card, wallet, cash
    public string Status { get; set; } = "pending"; // pending, completed, failed, refunded
    public string? TransactionId { get; set; }
    public string? PaymentGateway { get; set; } // stripe, paypal, jazzcash, easypaisa
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public User? User { get; set; }
    public Booking? Booking { get; set; }
}

public class Wallet
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public decimal Balance { get; set; } = 0;
    public string Currency { get; set; } = "PKR";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public User? User { get; set; }
}

public class WalletTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WalletId { get; set; }
    public string Type { get; set; } = string.Empty; // credit, debit
    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; }
    public string Description { get; set; } = string.Empty;
    public Guid? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; } // payment, refund, topup
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public Wallet? Wallet { get; set; }
}
