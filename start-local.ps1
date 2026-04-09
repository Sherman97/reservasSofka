param(
    [switch]$WithFrontend,
    [switch]$NoParallel
)

$ErrorActionPreference = "Stop"

function Assert-PortOpen {
    param(
        [int]$Port,
        [string]$Name
    )

    $result = Test-NetConnection -ComputerName "127.0.0.1" -Port $Port -WarningAction SilentlyContinue
    if (-not $result.TcpTestSucceeded) {
        throw "No hay conexion a $Name en 127.0.0.1:$Port. Levanta infraestructura primero."
    }
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot "Backend"
$frontendDir = Join-Path $repoRoot "Frontend"
$gradleWrapper = Join-Path $backendDir "gradlew.bat"

if (-not (Test-Path $gradleWrapper)) {
    throw "No se encontro gradlew.bat en $backendDir"
}

# Validate infra ports exposed by podman compose
Assert-PortOpen -Port 3307 -Name "MariaDB"
Assert-PortOpen -Port 5672 -Name "RabbitMQ AMQP"

# Local defaults for Spring services
$env:DB_HOST = "127.0.0.1"
$env:DB_PORT = "3307"
$env:DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "app_user" }
$env:DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "123456" }
$env:DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "app_db" }
$defaultJwtSecret = "reservas-sk-local-jwt-secret-2026-safe-key"
if (-not $env:JWT_SECRET -or $env:JWT_SECRET.Length -lt 32) {
    $env:JWT_SECRET = $defaultJwtSecret
    Write-Host "JWT_SECRET ajustado automaticamente (minimo 32 caracteres)." -ForegroundColor Yellow
}
$env:RABBITMQ_ENABLED = "true"
$env:RABBITMQ_HOST = "127.0.0.1"
$env:RABBITMQ_PORT = "5672"
$env:RABBITMQ_USER = if ($env:RABBITMQ_USER) { $env:RABBITMQ_USER } else { "guest" }
$env:RABBITMQ_PASSWORD = if ($env:RABBITMQ_PASSWORD) { $env:RABBITMQ_PASSWORD } else { "guest" }

if ($WithFrontend) {
    Start-Process powershell -WorkingDirectory $frontendDir -ArgumentList @("-NoExit", "-Command", "npm run dev") | Out-Null
    Write-Host "Frontend iniciado en otra ventana (vite)."
}

$bootTasks = @(
    ":auth-service:bootRun"
    ":bookings-service:bootRun"
    ":locations-service:bootRun"
    ":inventory-service:bootRun"
    ":notifications-service:bootRun"
    ":api-gateway:bootRun"
)

$args = @()
$args += $bootTasks
if (-not $NoParallel) {
    $args += "--parallel"
}

Write-Host "Iniciando backend local..."
Write-Host "Gateway: http://localhost:3000"
Write-Host "Auth: http://localhost:3001"
Write-Host "Bookings: http://localhost:3003"
Write-Host "Locations: http://localhost:3004"
Write-Host "Inventory: http://localhost:3005"
Write-Host "Notifications: http://localhost:3006"

Push-Location $backendDir
try {
    & $gradleWrapper @args
}
finally {
    Pop-Location
}
