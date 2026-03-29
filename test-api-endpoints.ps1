#!/usr/bin/env powershell
# Test script - directly call the APIs and show responses

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWI3YzRlMjliMDM4OTBhYzQ1NDM2N2MiLCJyb2xlIjoiYWRtaW4iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzczOTk4MjUwLCJleHAiOjE3NzQ2MDMwNTB9.wYVV15Jz8JS2sqGJurT5uU9p8aLph2l0m05ZntnQLSE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "=" * 70
Write-Host "TESTING ADMIN COMMISSIONS API ENDPOINTS" -ForegroundColor Cyan
Write-Host "=" * 70
Write-Host ""

# Test 1: Get All Commissions
Write-Host "TEST 1: GET /api/v1/admin/commissions" -ForegroundColor Yellow
Write-Host "-" * 70

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/v1/admin/commissions?page=1&limit=10" `
        -Headers $headers `
        -Method Get `
        -UseBasicParsing

    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Cyan
    $data = $response.Content | ConvertFrom-Json
    Write-Host ($data | ConvertTo-Json -Depth 3) -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Get Commission Stats
Write-Host "TEST 2: GET /api/v1/admin/commissions/stats" -ForegroundColor Yellow
Write-Host "-" * 70

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/v1/admin/commissions/stats" `
        -Headers $headers `
        -Method Get `
        -UseBasicParsing

    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Cyan
    $data = $response.Content | ConvertFrom-Json
    Write-Host ($data | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=" * 70
Write-Host "✅ TESTS COMPLETE" -ForegroundColor Green
Write-Host "=" * 70
