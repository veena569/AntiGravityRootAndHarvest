Add-Type -AssemblyName System.Drawing

$srcPath = "public\images\brand-banner-v2.jpg"
$dstPath = "public\images\brand-banner-v2.jpg"
$backupPath = "public\images\brand-banner-v2-original.jpg"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# Check dimensions
Write-Host "Original dimensions: $($src.Width) x $($src.Height)"

# Crop out top browser bar (0 to 45) and bottom extra whitespace
$cropX = 0
$cropY = 46
$cropW = $src.Width
$cropH = 744 - $cropY

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $src.Clone($rect, $src.PixelFormat)

$src.Dispose()

# Save backup and overwrite brand-banner-v2.jpg
$cropped.Save("public\images\brand-banner-clean.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$cropped.Dispose()

Copy-Item "public\images\brand-banner-clean.jpg" "public\images\brand-banner-v2.jpg" -Force
Copy-Item "public\images\brand-banner-clean.jpg" "public\images\brand-banner.jpg" -Force

Write-Host "Done! Cropped banner saved to brand-banner-v2.jpg and brand-banner.jpg"
