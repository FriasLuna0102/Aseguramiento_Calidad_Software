# Script para limpiar y reiniciar Next.js
Write-Host "Limpiando cache de Next.js..." -ForegroundColor Yellow

# Terminar procesos de Node.js
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpiar directorios de cache
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Directorio .next eliminado" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "Cache de node_modules eliminado" -ForegroundColor Green
}

Write-Host "Limpieza completada. Ahora ejecuta: npm run dev" -ForegroundColor Green
