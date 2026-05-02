# Script para mantener el servidor de Granja Premium corriendo
param(
    [switch]$Stop
)

$serverPath = Join-Path $PSScriptRoot "backend"
$appJsPath = Join-Path $serverPath "app.js"

# Verificar que los archivos existen
if (!(Test-Path $appJsPath)) {
    Write-Host "❌ Error: No se encuentra $appJsPath" -ForegroundColor Red
    exit 1
}

if ($Stop) {
    Write-Host "Deteniendo servidor..." -ForegroundColor Yellow
    $processes = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*app.js*"
    }
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Host "Servidor detenido." -ForegroundColor Green
    }
    else {
        Write-Host "No se encontró ningún servidor corriendo." -ForegroundColor Red
    }
    exit
}

Write-Host "🚀 Iniciando servidor de Granja Premium..." -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

Set-Location $serverPath

# Función para verificar si el puerto 3000 está en uso
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Verificar si ya hay un servidor corriendo
if (Test-Port 3000) {
    Write-Host "⚠️  El puerto 3000 ya está en uso. Deteniendo proceso anterior..." -ForegroundColor Yellow
    $processes = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*app.js*"
    }
    if ($processes) {
        $processes | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
}

# Bucle para mantener el servidor corriendo
$restartCount = 0
while ($true) {
    try {
        Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Iniciando servidor..." -ForegroundColor Cyan

        # Ejecutar el servidor y esperar a que termine
        $process = Start-Process -FilePath "node" -ArgumentList "`"$appJsPath`"" -NoNewWindow -Wait -PassThru

        # Si llega aquí, el servidor se detuvo
        $exitCode = $process.ExitCode
        $restartCount++

        if ($exitCode -eq 0) {
            Write-Host "✅ Servidor detenido normalmente (Exit code: $exitCode)" -ForegroundColor Green
            break
        } else {
            Write-Host "❌ Servidor falló con código $exitCode. Reinicio #$restartCount en 3 segundos..." -ForegroundColor Red
            Start-Sleep -Seconds 3
        }

    }
    catch {
        Write-Host "❌ Error al iniciar servidor: $($_.Exception.Message)" -ForegroundColor Red
        $restartCount++
        Write-Host "🔄 Reintentando en 5 segundos..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}