Add-Type -AssemblyName System.Drawing

function Crop-ImageFile($filePath) {
    if (Test-Path $filePath) {
        $src = [System.Drawing.Bitmap]::FromFile($filePath)
        $cropX = 0
        $cropY = 46
        $cropW = $src.Width
        $cropH = 744 - $cropY
        $rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
        $cropped = $src.Clone($rect, $src.PixelFormat)
        $src.Dispose()
        
        $tempPath = "$filePath.tmp.png"
        $cropped.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $cropped.Dispose()
        
        Move-Item $tempPath $filePath -Force
        Write-Host "Cropped: $filePath"
    }
}

Crop-ImageFile "public\images\brand-story-banner.png"
Crop-ImageFile "public\images\brand-story-banner-v2.png"
