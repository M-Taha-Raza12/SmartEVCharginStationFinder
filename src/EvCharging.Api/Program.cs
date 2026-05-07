using System.Text;
using System.Security.Cryptography;
using System.Security.Claims;
using EvCharging.Api.Data;
using EvCharging.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization for DateOnly and TimeOnly
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Load JWT settings AFTER all configuration sources are loaded
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();

// Ensure JWT secret is set
if (string.IsNullOrWhiteSpace(jwtSettings.Secret))
{
    if (builder.Environment.IsDevelopment())
    {
        // Generate a random secret for this session
        jwtSettings.Secret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        Console.WriteLine("[JWT] Generated random secret for development");
    }
    else
    {
        throw new InvalidOperationException(
            "JWT secret is not configured. Set Jwt__Secret (recommended) or Jwt:Secret in configuration.");
    }
}
else
{
    Console.WriteLine($"[JWT] Using configured secret (length: {jwtSettings.Secret.Length})");
}

// Configure JWT settings for dependency injection
builder.Services.Configure<JwtSettings>(options =>
{
    options.Secret = jwtSettings.Secret;
    options.Issuer = jwtSettings.Issuer;
    options.Audience = jwtSettings.Audience;
    options.ExpiryMinutes = jwtSettings.ExpiryMinutes;
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            RoleClaimType = ClaimTypes.Role // Explicitly set role claim type
        };
    });

builder.Services.AddAuthorization();

// Always try Supabase first
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"[DB] Connection string configured: {!string.IsNullOrWhiteSpace(connectionString)}");

if (!string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("[DB] Attempting to connect to Supabase...");
    try
    {
        var dataSourceBuilder = new Npgsql.NpgsqlDataSourceBuilder(connectionString);
        var dataSource = dataSourceBuilder.Build();
        builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(dataSource));
        Console.WriteLine("[DB] ✅ Supabase connection configured!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB] ❌ Supabase configuration failed: {ex.Message}");
        Console.WriteLine("[DB] Falling back to in-memory database");
        builder.Services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase("evcharging-dev"));
    }
}
else
{
    Console.WriteLine("[DB] No connection string, using in-memory database");
    builder.Services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase("evcharging-dev"));
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApp", policy =>
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<AiRecommendationService>();
builder.Services.AddHttpClient();

var app = builder.Build();

// --- Database initialization: split into individual statements for PGBouncer compatibility ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    if (db.Database.IsRelational())
    {
        var sqlStatements = new[]
        {
            @"CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'Client',
                business_name VARCHAR(150),
                contact_details TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            @"CREATE TABLE IF NOT EXISTS charging_stations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                address TEXT,
                latitude DECIMAL(9,6) NOT NULL,
                longitude DECIMAL(9,6) NOT NULL,
                price_per_kwh DECIMAL(6,2) NOT NULL,
                total_slots INT NOT NULL,
                available_slots INT NOT NULL,
                owner_id UUID,
                is_approved BOOLEAN DEFAULT false,
                working_hours_start TIME,
                working_hours_end TIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            @"CREATE TABLE IF NOT EXISTS bookings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID,
                station_id UUID,
                booking_date DATE NOT NULL,
                start_time TIME NOT NULL,
                duration_minutes INT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            @"CREATE TABLE IF NOT EXISTS reviews (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID,
                station_id UUID,
                booking_id UUID,
                rating INT CHECK (rating BETWEEN 1 AND 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name VARCHAR(150)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_details TEXT",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true",
            "ALTER TABLE charging_stations ADD COLUMN IF NOT EXISTS owner_id UUID",
            "ALTER TABLE charging_stations ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false",
            "ALTER TABLE charging_stations ADD COLUMN IF NOT EXISTS working_hours_start TIME",
            "ALTER TABLE charging_stations ADD COLUMN IF NOT EXISTS working_hours_end TIME",
            "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS booking_id UUID",
            // New tables for additional features
            @"CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(20) DEFAULT 'info',
                related_entity_type VARCHAR(50),
                related_entity_id UUID,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            @"CREATE TABLE IF NOT EXISTS favorites (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                station_id UUID NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, station_id)
            )",
            @"CREATE TABLE IF NOT EXISTS payments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                booking_id UUID NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'PKR',
                payment_method VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                transaction_id VARCHAR(200),
                payment_gateway VARCHAR(50),
                paid_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            @"CREATE TABLE IF NOT EXISTS wallets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL UNIQUE,
                balance DECIMAL(10,2) DEFAULT 0,
                currency VARCHAR(10) DEFAULT 'PKR',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            @"CREATE TABLE IF NOT EXISTS wallet_transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                wallet_id UUID NOT NULL,
                type VARCHAR(20) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                balance_after DECIMAL(10,2) NOT NULL,
                description TEXT NOT NULL,
                related_entity_id UUID,
                related_entity_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            @"CREATE TABLE IF NOT EXISTS charging_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                booking_id UUID NOT NULL,
                user_id UUID NOT NULL,
                station_id UUID NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                energy_consumed DECIMAL(10,2) DEFAULT 0,
                cost DECIMAL(10,2) DEFAULT 0,
                status VARCHAR(20) DEFAULT 'active',
                start_battery_level INT,
                end_battery_level INT,
                peak_power DECIMAL(10,2),
                average_power DECIMAL(10,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )"
        };

        foreach (var sql in sqlStatements)
        {
            try
            {
                db.Database.ExecuteSqlRaw(sql);
                var preview = sql.Length > 60 ? sql.Substring(0, 60).Trim() : sql.Trim();
                Console.WriteLine($"DB INIT OK: {preview}...");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DB INIT ERROR: {ex.Message}");
            }
        }
    }
    else
    {
        // In-memory database - ensure it's created and seed data
        await db.Database.EnsureCreatedAsync();
        Console.WriteLine("[DB] In-memory database created");
        await DbSeeder.SeedAsync(db);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseCors("ClientApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
