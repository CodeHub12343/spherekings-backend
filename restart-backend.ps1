#!/usr/bin/env powershell
# Hard restart script for backend

Write-Host "🔪 FORCE KILLING ALL NODE PROCESSES..." -ForegroundColor Red
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "✅ All Node processes killed" -ForegroundColor Green
Write-Host ""

Write-Host "🧹 Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force -ErrorAction SilentlyContinue | Out-Null

Write-Host "✅ Cache cleared" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 STARTING BACKEND SERVER..." -ForegroundColor Yellow
Write-Host "=" * 60

npm run dev
