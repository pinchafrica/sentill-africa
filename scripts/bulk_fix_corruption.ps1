# bulk_fix_corruption.ps1
# Truncates all TSX/TS files that have "use client" appearing more than once
# (a symptom of being corrupted by repeated content appends)

$root = "c:\Users\USER\Downloads\Sentil"
$fixed = 0
$skipped = 0

$files = Get-ChildItem -Path "$root\components","$root\app" -Recurse -Include "*.tsx","*.ts" |
  Where-Object { $_.FullName -notmatch "node_modules|\.next" }

foreach ($file in $files) {
  $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
  $text  = [System.Text.Encoding]::UTF8.GetString($bytes)

  $marker = '"use client"'
  $first  = $text.IndexOf($marker)
  if ($first -lt 0) { $skipped++; continue }

  $second = $text.IndexOf($marker, $first + $marker.Length)
  if ($second -lt 0) { $skipped++; continue }

  # Take content up to (not including) the second "use client"
  $clean = $text.Substring(0, $second).TrimEnd()

  [System.IO.File]::WriteAllText($file.FullName, $clean, [System.Text.Encoding]::UTF8)
  $sizeKB = [Math]::Round($clean.Length / 1KB, 1)
  Write-Host "FIXED: $($file.Name) -> ${sizeKB}KB"
  $fixed++
}

Write-Host ""
Write-Host "Done. Fixed: $fixed | Already clean: $skipped"
