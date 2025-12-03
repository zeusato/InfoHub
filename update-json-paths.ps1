# ============================================
# Script: Update JSON Paths
# Purpose: Update image paths in leafContent.json after rename
# ============================================

$jsonFile = "src\data\leafContent.json"
$mappingFile = "image-rename-mapping.json"

if (-not (Test-Path $mappingFile)) {
    Write-Host "❌ Mapping file not found: $mappingFile" -ForegroundColor Red
    Write-Host "   Run rename-images.ps1 first!" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $jsonFile)) {
    Write-Host "❌ JSON file not found: $jsonFile" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Loading mapping..." -ForegroundColor Cyan
$mapping = Get-Content $mappingFile -Raw | ConvertFrom-Json

Write-Host "📖 Reading JSON file..." -ForegroundColor Cyan
$jsonContent = Get-Content $jsonFile -Raw -Encoding UTF8

$updateCount = 0

Write-Host "🔍 Updating paths..." -ForegroundColor Cyan

# Convert hashtable for easier lookup
$mappingHash = @{}
$mapping.PSObject.Properties | ForEach-Object {
    $mappingHash[$_.Name] = $_.Value
}

foreach ($oldPath in $mappingHash.Keys) {
    $newPath = $mappingHash[$oldPath]
    
    # Remove 'public/' prefix for JSON paths
    $oldJsonPath = $oldPath -replace '^public/', ''
    $newJsonPath = $newPath -replace '^public/', ''
    
    if ($jsonContent -match [regex]::Escape($oldJsonPath)) {
        $jsonContent = $jsonContent -replace [regex]::Escape($oldJsonPath), $newJsonPath
        $updateCount++
        Write-Host "  ✅ Updated: $oldJsonPath → $newJsonPath" -ForegroundColor Green
    }
}

if ($updateCount -gt 0) {
    # Backup original
    $backupFile = "$jsonFile.backup"
    Copy-Item $jsonFile $backupFile -Force
    Write-Host "💾 Backup created: $backupFile" -ForegroundColor Yellow
    
    # Save updated JSON
    $jsonContent | Out-File $jsonFile -Encoding UTF8 -NoNewline
    
    Write-Host ""
    Write-Host "✅ JSON updated successfully!" -ForegroundColor Green
    Write-Host "📊 Total updates: $updateCount" -ForegroundColor Cyan
}
else {
    Write-Host ""
    Write-Host "ℹ️  No paths needed updating" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
