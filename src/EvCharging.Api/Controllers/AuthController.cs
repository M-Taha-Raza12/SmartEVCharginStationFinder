using System.Security.Claims;
using EvCharging.Api.Data;
using EvCharging.Api.Dtos;
using EvCharging.Api.Models;
using EvCharging.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvCharging.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext dbContext, JwtTokenService tokenService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var bootstrapAdminEmail = HttpContext.RequestServices.GetService<IHostEnvironment>()?.IsDevelopment() == true
            ? HttpContext.RequestServices.GetService<IConfiguration>()?["Dev:BootstrapAdminEmail"]
            : null;

        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await dbContext.Users.AnyAsync(u => u.Email == email);
        if (exists)
        {
            return Conflict(new { message = "Email already exists." });
        }

        if (!IsStrongPassword(request.Password))
        {
            return BadRequest(new { message = "Password must be at least 8 characters with letters and numbers." });
        }

        var requestedRole = request.Role.Trim();
        if (requestedRole != "Owner" && requestedRole != "Client")
        {
            requestedRole = "Client";
        }

        // Validate Owner registration requires business details
        if (requestedRole == "Owner" && string.IsNullOrWhiteSpace(request.BusinessName))
        {
            return BadRequest(new { message = "Business name is required for Owner registration." });
        }

        var isSuperAdmin = !string.IsNullOrWhiteSpace(bootstrapAdminEmail) &&
                   string.Equals(email, bootstrapAdminEmail.Trim().ToLowerInvariant(), StringComparison.Ordinal);

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = isSuperAdmin ? "SuperAdmin" : requestedRole,
            BusinessName = request.BusinessName?.Trim(),
            ContactDetails = request.ContactDetails?.Trim(),
            IsActive = true
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var token = tokenService.Generate(user);
        return Ok(new AuthResponse
        {
            Token = token,
            User = ToSummary(user)
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        try
        {
            var email = request.Email.Trim().ToLowerInvariant();
            Console.WriteLine($"[LOGIN] Attempting login for email: {email}");
            
            var user = await dbContext.Users.SingleOrDefaultAsync(u => u.Email == email);
            
            if (user is null)
            {
                Console.WriteLine($"[LOGIN] User not found: {email}");
                return Unauthorized(new { message = "Invalid credentials." });
            }

            Console.WriteLine($"[LOGIN] User found: {user.Email}, Role: {user.Role}, Active: {user.IsActive}");
            Console.WriteLine($"[LOGIN] Password hash starts with: {user.PasswordHash.Substring(0, 10)}");
            Console.WriteLine($"[LOGIN] Attempting BCrypt verification...");
            
            var passwordMatches = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            Console.WriteLine($"[LOGIN] Password verification result: {passwordMatches}");
            
            if (!passwordMatches)
            {
                Console.WriteLine($"[LOGIN] Password mismatch for: {email}");
                return Unauthorized(new { message = "Invalid credentials." });
            }

            Console.WriteLine($"[LOGIN] Login successful for: {email}");
            return Ok(new AuthResponse
            {
                Token = tokenService.Generate(user),
                User = ToSummary(user)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LOGIN ERROR] {ex.Message}");
            Console.WriteLine($"[LOGIN ERROR STACK] {ex.StackTrace}");
            return StatusCode(500, new { message = "An error occurred during login." });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserSummary>> Me()
    {
        try
        {
            Console.WriteLine("[AUTH/ME] Endpoint called");
            Console.WriteLine($"[AUTH/ME] User.Identity.IsAuthenticated: {User.Identity?.IsAuthenticated}");
            Console.WriteLine($"[AUTH/ME] Claims count: {User.Claims.Count()}");
            
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"[AUTH/ME] Claim: {claim.Type} = {claim.Value}");
            }
            
            // Try to get sub claim using different methods
            var subClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                        ?? User.FindFirstValue("sub")
                        ?? User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            
            Console.WriteLine($"[AUTH/ME] Sub claim value: {subClaim}");
            
            if (string.IsNullOrEmpty(subClaim) || !Guid.TryParse(subClaim, out var userId))
            {
                Console.WriteLine($"[AUTH/ME] Failed to parse sub claim as GUID: {subClaim}");
                return Unauthorized(new { message = "Invalid token: sub claim missing or invalid" });
            }

            Console.WriteLine($"[AUTH/ME] Looking for user with ID: {userId}");
            var user = await dbContext.Users.FindAsync(userId);
            
            if (user is null)
            {
                Console.WriteLine($"[AUTH/ME] User not found with ID: {userId}");
                return NotFound(new { message = "User not found" });
            }

            Console.WriteLine($"[AUTH/ME] User found: {user.Email}, Role: {user.Role}");
            return Ok(ToSummary(user));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AUTH/ME ERROR] {ex.Message}");
            Console.WriteLine($"[AUTH/ME ERROR STACK] {ex.StackTrace}");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    private static bool IsStrongPassword(string password)
    {
        var hasLetter = password.Any(char.IsLetter);
        var hasDigit = password.Any(char.IsDigit);
        return password.Length >= 8 && hasLetter && hasDigit;
    }

    private static UserSummary ToSummary(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        Role = user.Role,
        BusinessName = user.BusinessName,
        ContactDetails = user.ContactDetails,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
    };
}
