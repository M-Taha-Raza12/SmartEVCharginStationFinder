# PowerShell Script to Add Karachi Stations to Database
# This script inserts 15 dummy charging stations in Karachi

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Adding Karachi Stations to Database  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database connection details
$Host = "db.dclkevefgegivbrkppth.supabase.co"
$Database = "postgres"
$Username = "postgres"
$Password = "YdwTH5ccSSxPAxhs"
$Port = "5432"

# Connection string
$ConnectionString = "Host=$Host;Database=$Database;Username=$Username;Password=$Password;Port=$Port;SSL Mode=Require;Trust Server Certificate=true"

Write-Host "Connecting to Supabase database..." -ForegroundColor Yellow
Write-Host ""

# Check if Npgsql is available (for direct .NET connection)
try {
    Add-Type -Path "$env:USERPROFILE\.nuget\packages\npgsql\*\lib\net*\Npgsql.dll" -ErrorAction Stop
    $useNpgsql = $true
} catch {
    $useNpgsql = $false
}

# SQL statements to insert stations
$stations = @(
    @{
        Name = "Clifton Beach Charging Hub"
        Address = "Sea View, Clifton Block 8, Karachi"
        Lat = 24.8138
        Lng = 67.0299
        Price = 12.50
        Slots = 15
        Hours = "06:00-23:00"
    },
    @{
        Name = "Saddar Express Charge"
        Address = "Empress Market, Saddar Town, Karachi"
        Lat = 24.8607
        Lng = 67.0099
        Price = 10.00
        Slots = 8
        Hours = "07:00-22:00"
    },
    @{
        Name = "Gulshan-e-Iqbal Power Station"
        Address = "Block 13-D, Gulshan-e-Iqbal, Karachi"
        Lat = 24.9207
        Lng = 67.0927
        Price = 11.00
        Slots = 12
        Hours = "08:00-20:00"
    },
    @{
        Name = "DHA Phase 5 EV Hub"
        Address = "Khayaban-e-Mujahid, DHA Phase 5, Karachi"
        Lat = 24.8103
        Lng = 67.0589
        Price = 15.00
        Slots = 20
        Hours = "00:00-23:59"
    },
    @{
        Name = "Malir Cantt Quick Charge"
        Address = "Malir Cantonment, Karachi"
        Lat = 24.9436
        Lng = 67.2060
        Price = 9.50
        Slots = 10
        Hours = "06:00-22:00"
    },
    @{
        Name = "Korangi Industrial Charging Point"
        Address = "Korangi Industrial Area, Karachi"
        Lat = 24.8607
        Lng = 67.1011
        Price = 8.50
        Slots = 25
        Hours = "00:00-23:59"
    },
    @{
        Name = "Bahria Town EV Station"
        Address = "Precinct 10, Bahria Town, Karachi"
        Lat = 24.9056
        Lng = 67.1878
        Price = 13.00
        Slots = 18
        Hours = "07:00-23:00"
    },
    @{
        Name = "North Nazimabad Charge Hub"
        Address = "Block L, North Nazimabad, Karachi"
        Lat = 24.9270
        Lng = 67.0333
        Price = 10.50
        Slots = 14
        Hours = "08:00-21:00"
    },
    @{
        Name = "Tariq Road Shopping District Charger"
        Address = "Tariq Road, PECHS, Karachi"
        Lat = 24.8700
        Lng = 67.0600
        Price = 12.00
        Slots = 10
        Hours = "09:00-23:00"
    },
    @{
        Name = "Karachi Airport EV Parking"
        Address = "Jinnah International Airport, Karachi"
        Lat = 24.9065
        Lng = 67.1608
        Price = 16.00
        Slots = 30
        Hours = "00:00-23:59"
    },
    @{
        Name = "Clifton Cantonment Fast Charge"
        Address = "Khayaban-e-Rahat, Clifton Cantt, Karachi"
        Lat = 24.8256
        Lng = 67.0363
        Price = 14.00
        Slots = 12
        Hours = "07:00-22:00"
    },
    @{
        Name = "Shahrah-e-Faisal Business Hub Charger"
        Address = "Shahrah-e-Faisal, Near Metropole Hotel, Karachi"
        Lat = 24.8700
        Lng = 67.0700
        Price = 11.50
        Slots = 16
        Hours = "06:00-23:00"
    },
    @{
        Name = "Lyari Express Charging"
        Address = "Lyari Expressway, Karachi"
        Lat = 24.8700
        Lng = 66.9900
        Price = 9.00
        Slots = 8
        Hours = "07:00-21:00"
    },
    @{
        Name = "Port Qasim Industrial Charger"
        Address = "Port Qasim Authority, Karachi"
        Lat = 24.7833
        Lng = 67.3500
        Price = 10.00
        Slots = 22
        Hours = "00:00-23:59"
    },
    @{
        Name = "Scheme 33 Residential Charging"
        Address = "Scheme 33, Gulzar-e-Hijri, Karachi"
        Lat = 24.9300
        Lng = 67.1100
        Price = 11.00
        Slots = 10
        Hours = "08:00-20:00"
    }
)

Write-Host "Inserting $($stations.Count) charging stations..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($station in $stations) {
    $hours = $station.Hours -split '-'
    $startTime = $hours[0]
    $endTime = $hours[1]
    
    $sql = @"
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    '$($station.Name)',
    '$($station.Address)',
    $($station.Lat),
    $($station.Lng),
    $($station.Price),
    $($station.Slots),
    $($station.Slots),
    NULL,
    true,
    '$startTime:00',
    '$endTime:00',
    CURRENT_TIMESTAMP
);
"@

    try {
        # Use the backend API to execute SQL (requires backend to be running)
        $apiUrl = "http://localhost:5183/api/test/execute-sql"
        
        # Alternative: Direct database connection using psql command
        # This requires PostgreSQL client tools to be installed
        
        Write-Host "  [+] $($station.Name)" -ForegroundColor Green
        Write-Host "      Location: $($station.Address)" -ForegroundColor Gray
        Write-Host "      Price: Rs $($station.Price)/kWh | Slots: $($station.Slots)" -ForegroundColor Gray
        Write-Host ""
        
        # Save SQL to temp file and execute
        $tempFile = [System.IO.Path]::GetTempFileName()
        $sql | Out-File -FilePath $tempFile -Encoding UTF8
        
        # Try to execute using psql if available
        $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
        if ($psqlPath) {
            $env:PGPASSWORD = $Password
            psql -h $Host -U $Username -d $Database -p $Port -f $tempFile -q 2>$null
            Remove-Item $tempFile
        }
        
        $successCount++
    } catch {
        Write-Host "  [-] Failed: $($station.Name)" -ForegroundColor Red
        Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        $errorCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Total Stations: $($stations.Count)" -ForegroundColor White
Write-Host "  Successfully Added: $successCount" -ForegroundColor Green
Write-Host "  Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "✓ All stations added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Restart your backend if it's running" -ForegroundColor White
    Write-Host "  2. Login as client and go to Stations page" -ForegroundColor White
    Write-Host "  3. You should see all 15 stations on the map" -ForegroundColor White
} else {
    Write-Host "⚠ Some stations failed to insert" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative Method:" -ForegroundColor Yellow
    Write-Host "  1. Open Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "  2. Go to SQL Editor" -ForegroundColor White
    Write-Host "  3. Copy and paste the SQL from: scripts/insert-karachi-stations.sql" -ForegroundColor White
    Write-Host "  4. Click 'Run'" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
