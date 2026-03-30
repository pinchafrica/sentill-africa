param(
    [string]$Name,
    [string]$Value
)
$tmpFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tmpFile, $Value, [System.Text.Encoding]::UTF8)
Get-Content -Raw $tmpFile | npx vercel env add $Name production
Remove-Item $tmpFile
