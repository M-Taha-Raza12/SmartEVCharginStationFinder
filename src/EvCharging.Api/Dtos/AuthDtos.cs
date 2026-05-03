using System.ComponentModel.DataAnnotations;

namespace EvCharging.Api.Dtos;

public class RegisterRequest
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Role { get; set; } = "Client";

    [MaxLength(150)]
    public string? BusinessName { get; set; }

    public string? ContactDetails { get; set; }
}

public class LoginRequest
{
    [Required, EmailAddress, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserSummary User { get; set; } = new();
}

public class UserSummary
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? BusinessName { get; set; }
    public string? ContactDetails { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
