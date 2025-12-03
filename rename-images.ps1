# Vietnamese to ASCII Character Remapping Script
# Run this to rename all images with Vietnamese characters

function Convert-ToAscii {
    param([string]$text)
    
    # Vietnamese character mapping
    $text = $text -replace '[áàảãạăắằẳẵặâấầẩẫậ]', 'a'
    $text = $text -replace '[ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ]', 'A'
    $text = $text -replace '[éèẻẽẹêếềểễệ]', 'e'
    $text = $text -replace '[ÉÈẺẼẸÊẾỀỂỄỆ]', 'E'
    $text = $text -replace '[íìỉĩị]', 'i'
    $text = $text -replace '[ÍÌỈĨỊ]', 'I'
    $text = $text -replace '[óòỏõọôốồổỗộơớờởỡợ]', 'o'
    $text = $text -replace '[ÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]', 'O'
    $text = $text -replace '[úùủũụưứừửữự]', 'u'
    $text = $text -replace '[ÚÙỦŨỤƯỨỪỬỮỰ]', 'U'
    $text = $text -replace '[ýỳỷỹỵ]', 'y'
    $text = $text -replace '[ÝỲỶỸỴ]', 'Y'
    $text = $text -replace 'đ', 'd'
    $text = $text -replace 'Đ', 'D'
    
    # Remove special characters
    $text = $text -replace '[^\w\s\-\.]', ''
    # Replace spaces with dash
    $text = $text -replace '\s+', '-'
    # Remove multiple dashes
    $text = $text -replace '-+', '-'
    
    return $text
}

$mapping = @{}
$folders = @("public\hdsd", "public\faqs")

Write-Host "Starting image rename..." -ForegroundColor Cyan

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) { continue }
    
    Write-Host "Processing: $folder" -ForegroundColor Green
    
    $files = Get-ChildItem -Path $folder -File -Include *.jpg,*.jpeg,*.png,*.gif,*.webp
    
    foreach ($file in $files) {
        $newBaseName = Convert-ToAscii $file.BaseName
        $newName = "$newBaseName$($file.Extension.ToLower())"
        
        if ($file.Name -ne $newName) {
            $newPath = Join-Path $file.DirectoryName $newName
            
            # Handle duplicates
            $counter = 1
            while (Test-Path $newPath) {
                $newName = "$newBaseName-$counter$($file.Extension.ToLower())"
                $newPath = Join-Path $file.DirectoryName $newName
                $counter++
            }
            
            try {
                $oldRel = $file.FullName -replace [regex]::Escape((Get-Location).Path + '\'), '' -replace '\\', '/'
                Rename-Item -Path $file.FullName -NewName $newName -ErrorAction Stop
                $newRel = $oldRel -replace [regex]::Escape($file.Name), $newName
                
                $mapping[$oldRel] = $newRel
                
                Write-Host "  OK: $($file.Name) -> $newName" -ForegroundColor Gray
            }
            catch {
                Write-Host "  FAIL: $($file.Name)" -ForegroundColor Red
            }
        }
    }
}

$mapping | ConvertTo-Json | Out-File "image-rename-mapping.json" -Encoding UTF8
Write-Host "`nDone! Renamed $($mapping.Count) files" -ForegroundColor Green
Write-Host "Run update-json-paths.ps1 next" -ForegroundColor Yellow
