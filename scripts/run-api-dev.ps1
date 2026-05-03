Param(
  [ValidateSet('http','https')]
  [string]$Profile = 'http'
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$apiPath = Join-Path $root 'src\EvCharging.Api'

Set-Location $apiPath

Write-Host "Enter configuration values (not saved)." -ForegroundColor Cyan
$cs = Read-Host "ConnectionStrings__DefaultConnection (blank = in-memory DB for Development)"
if (-not [string]::IsNullOrWhiteSpace($cs)) {
  function Convert-PostgresUriToNpgsqlConnectionString([string]$uriString) {
    $trimmed = $uriString.Trim()
    if (-not ($trimmed.StartsWith('postgresql://') -or $trimmed.StartsWith('postgres://'))) {
      return $trimmed
    }

    $uri = [System.Uri]::new($trimmed)
    $user = ''
    $pass = ''
    if (-not [string]::IsNullOrWhiteSpace($uri.UserInfo)) {
      $userInfoParts = $uri.UserInfo.Split(':', 2)
      $user = [System.Uri]::UnescapeDataString($userInfoParts[0])
      if ($userInfoParts.Length -eq 2) {
        $pass = [System.Uri]::UnescapeDataString($userInfoParts[1])
      }
    }

    $pgHost = $uri.Host
    $pgPort = if ($uri.IsDefaultPort) { '5432' } else { [string]$uri.Port }

    $dbName = $uri.AbsolutePath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($dbName)) {
      throw "Invalid Postgres URI: missing database name in path."
    }
    $dbName = [System.Uri]::UnescapeDataString($dbName)

    $sslMode = $null
    if (-not [string]::IsNullOrWhiteSpace($uri.Query)) {
      foreach ($pair in $uri.Query.TrimStart('?').Split('&')) {
        if ([string]::IsNullOrWhiteSpace($pair)) { continue }
        $kv = $pair.Split('=', 2)
        if ($kv.Length -eq 2 -and $kv[0].ToLowerInvariant() -eq 'sslmode') {
          $sslMode = $kv[1]
        }
      }
    }

    # Supabase generally requires SSL.
    $sslModeValue = 'Require'
    if (-not [string]::IsNullOrWhiteSpace($sslMode)) {
      switch ($sslMode.ToLowerInvariant()) {
        'disable' { $sslModeValue = 'Disable' }
        'allow' { $sslModeValue = 'Prefer' }
        'prefer' { $sslModeValue = 'Prefer' }
        'require' { $sslModeValue = 'Require' }
        'verify-ca' { $sslModeValue = 'VerifyCA' }
        'verify-full' { $sslModeValue = 'VerifyFull' }
        default { $sslModeValue = 'Require' }
      }
    }

    return "Host=$pgHost;Port=$pgPort;Database=$dbName;Username=$user;Password=$pass;Ssl Mode=$sslModeValue;Trust Server Certificate=true"
  }

  try {
    $converted = Convert-PostgresUriToNpgsqlConnectionString $cs
    if ($converted -ne $cs) {
      Write-Host "Converted Postgres URI to Npgsql connection string format." -ForegroundColor DarkYellow
    }
    $env:ConnectionStrings__DefaultConnection = $converted
  } catch {
    Write-Host "Failed to parse Postgres URI connection string; passing through as-is. $($_.Exception.Message)" -ForegroundColor DarkYellow
    $env:ConnectionStrings__DefaultConnection = $cs
  }
}

$jwt = Read-Host "Jwt__Secret (optional; blank = auto-generate in Development)"
if (-not [string]::IsNullOrWhiteSpace($jwt)) {
  $env:Jwt__Secret = $jwt
}

$admin = Read-Host "Dev__BootstrapAdminEmail (optional)"
if (-not [string]::IsNullOrWhiteSpace($admin)) {
  $env:Dev__BootstrapAdminEmail = $admin
}

$groq = Read-Host "Groq__ApiKey (optional)"
if (-not [string]::IsNullOrWhiteSpace($groq)) {
  $env:Groq__ApiKey = $groq
}

Write-Host "Starting API (launch profile: $Profile)..." -ForegroundColor Green
Write-Host "HTTP:  http://localhost:5183" -ForegroundColor DarkGreen
Write-Host "HTTPS: https://localhost:7264" -ForegroundColor DarkGreen

# Keep the process in the foreground
& dotnet run --launch-profile $Profile
