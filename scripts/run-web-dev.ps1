Param(
  [ValidateSet('http','https')]
  [string]$ApiScheme = 'http'
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$webPath = Join-Path $root 'src\evcharging.web'

Set-Location $webPath

if ($ApiScheme -eq 'https') {
  $env:VITE_API_BASE_URL = 'https://localhost:7264/api'
} else {
  $env:VITE_API_BASE_URL = 'http://localhost:5183/api'
}

Write-Host "Using VITE_API_BASE_URL=$env:VITE_API_BASE_URL" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
  Write-Host "node_modules not found; running npm install..." -ForegroundColor Yellow
  npm install
}

npm run dev
