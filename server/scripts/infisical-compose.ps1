[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidateSet('up', 'down', 'config')]
  [string]$Action
)

$ErrorActionPreference = 'Stop'

$projectId = '4f20a364-4275-4d48-8eeb-5c4f3dec1183'
$environment = 'staging'
$clientId = [Environment]::GetEnvironmentVariable('INFISICAL_CLIENT_ID', 'User')
$clientSecret = [Environment]::GetEnvironmentVariable('INFISICAL_CLIENT_SECRET', 'User')
$infisical = Join-Path $env:APPDATA 'npm\node_modules\@infisical\cli\bin\infisical.exe'

if ([string]::IsNullOrWhiteSpace($clientId) -or [string]::IsNullOrWhiteSpace($clientSecret)) {
  throw 'Set INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET in the Windows user environment first.'
}
if (-not (Test-Path -LiteralPath $infisical)) {
  throw 'Infisical CLI is not installed. Run: npm install -g @infisical/cli'
}

$token = & $infisical login --method=universal-auth --client-id=$clientId --client-secret=$clientSecret --silent --plain
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($token)) {
  throw 'Infisical Universal Auth failed.'
}

$composeArgs = switch ($Action) {
  'up' { @('up', '--build', '--wait') }
  'down' { @('down') }
  'config' { @('config', '--quiet') }
}

try {
  & $infisical run --token=$token --projectId=$projectId --env=$environment -- docker compose -f infrastructure/docker-compose.yml @composeArgs
  exit $LASTEXITCODE
} finally {
  Remove-Variable token, clientId, clientSecret -ErrorAction SilentlyContinue
}
