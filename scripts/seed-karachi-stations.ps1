# Simple script to seed Karachi stations via API
# Make sure the backend is running on http://localhost:5183

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Seeding Karachi Stations via API     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "http://localhost:5183/api/test/seed-karachi-stations"

Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-WebRequest -Uri "http://localhost:5183/api/test/db-test" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Backend is running!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd src/EvCharging.Api" -ForegroundColor White
    Write-Host "  dotnet run" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "Sending request to seed stations..." -ForegroundColor Yellow
Write-Host "API: $apiUrl" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  SUCCESS!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "✓ $($response.message)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Stations Added:" -ForegroundColor Cyan
        Write-Host ""
        
        foreach ($station in $response.stations) {
            Write-Host "  • $($station.name)" -ForegroundColor White
            Write-Host "    $($station.address)" -ForegroundColor Gray
            Write-Host "    Rs $($station.pricePerKwh)/kWh | $($station.totalSlots) slots" -ForegroundColor Gray
            Write-Host ""
        }
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Next Steps" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Open your browser: http://localhost:5173" -ForegroundColor White
        Write-Host "2. Login as client: client@test.com / Client@123" -ForegroundColor White
        Write-Host "3. Go to 'Stations' page" -ForegroundColor White
        Write-Host "4. You should see all 15 stations on the map!" -ForegroundColor White
        Write-Host ""
        
    } else {
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host "  INFO" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "$($response.message)" -ForegroundColor Yellow
        Write-Host ""
        
        if ($response.existingCount) {
            Write-Host "Existing Karachi stations: $($response.existingCount)" -ForegroundColor White
            Write-Host ""
            Write-Host "The stations are already in the database." -ForegroundColor White
            Write-Host "You can view them in the Stations page." -ForegroundColor White
        }
        Write-Host ""
    }
    
} catch {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed to seed stations!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Make sure backend is running on http://localhost:5183" -ForegroundColor White
    Write-Host "  2. Check if database connection is working" -ForegroundColor White
    Write-Host "  3. Check backend console for errors" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
