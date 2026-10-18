[CmdletBinding()]
param(
  [string]$EnvironmentFile = '.env.hosted.local'
)

$ErrorActionPreference = 'Stop'

$environmentPath = Join-Path (Join-Path $PSScriptRoot '..') $EnvironmentFile
$environmentPath = [System.IO.Path]::GetFullPath($environmentPath)
if (-not (Test-Path -LiteralPath $environmentPath)) {
  throw "Hosted environment file not found: $environmentPath. Copy .env.hosted.example to .env.hosted.local first."
}

Get-Content -LiteralPath $environmentPath | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#')) { return }
  if ($line -notmatch '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
    throw "Invalid environment entry in $environmentPath."
  }

  $name = $Matches[1]
  $value = $Matches[2].Trim()
  if ($value.Length -ge 2 -and (
    ($value.StartsWith('"') -and $value.EndsWith('"')) -or
    ($value.StartsWith("'") -and $value.EndsWith("'"))
  )) {
    $value = $value.Substring(1, $value.Length - 2)
  }
  [Environment]::SetEnvironmentVariable($name, $value, 'Process')
}

# Every native service has a different default listener; a shared PORT would
# make them collide. Keep service-to-service traffic on this machine.
Remove-Item Env:PORT -ErrorAction SilentlyContinue
$env:CORE_TRIP_SERVICE_URL = 'http://127.0.0.1:4101'
$env:GEO_LOCATION_SERVICE_URL = 'http://127.0.0.1:4102'

$required = @(
  'SUPABASE_URL', 'SUPABASE_JWKS_URL', 'SUPABASE_JWT_ISSUER', 'DATABASE_URL',
  'REDIS_URL', 'INTERNAL_SERVICE_TOKEN', 'CORS_ALLOWED_ORIGINS',
  'LOCATIONIQ_API_KEY'
)
$missing = $required | Where-Object {
  [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_, 'Process')) -or
  [Environment]::GetEnvironmentVariable($_, 'Process') -match 'CHANGE_ME|your-project|your-redis-host'
}
if ($missing.Count -gt 0) {
  throw "Missing or placeholder hosted configuration: $($missing -join ', ')."
}

$hostedUrls = @('SUPABASE_URL', 'SUPABASE_JWKS_URL', 'SUPABASE_JWT_ISSUER', 'DATABASE_URL', 'REDIS_URL')
$localEndpoints = foreach ($name in $hostedUrls) {
  try {
    $uri = [Uri][Environment]::GetEnvironmentVariable($name, 'Process')
    if ($uri.Host -in @('localhost', '127.0.0.1', 'host.docker.internal', 'redis')) {
      $name
    }
  } catch {
    $name
  }
}
if ($localEndpoints.Count -gt 0) {
  throw "Hosted profile requires non-local endpoints: $($localEndpoints -join ', ')."
}

$supabaseHosts = @('SUPABASE_URL', 'SUPABASE_JWKS_URL', 'SUPABASE_JWT_ISSUER') |
  ForEach-Object { ([Uri][Environment]::GetEnvironmentVariable($_, 'Process')).Host } |
  Select-Object -Unique
if ($supabaseHosts.Count -ne 1) {
  throw 'SUPABASE_URL, SUPABASE_JWKS_URL and SUPABASE_JWT_ISSUER must use the same hosted project.'
}

Write-Host 'Starting native services with hosted Supabase and Redis. Docker is not used.'
& pnpm --filter=@roadtrip/config run build
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
& pnpm --parallel --filter=api-gateway --filter=core-trip-service --filter=geo-location-service --filter=notification-worker run start:dev
exit $LASTEXITCODE
