$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$pins = Get-Content -LiteralPath (Join-Path $repoRoot 'tool-versions.json') -Raw | ConvertFrom-Json
$failures = @()
foreach ($tool in @('node', 'npm', 'go')) {
    $command = switch ($tool) { 'node' { 'node.exe' } 'npm' { 'npm.cmd' } 'go' { 'go.exe' } }
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        $failures += "$tool is missing; install the pinned version yourself."
        continue
    }
    $arguments = if ($tool -eq 'go') { @('version') } else { @('--version') }
    $output = & $command @arguments
    if ($LASTEXITCODE -ne 0) { throw "$tool version command failed ($LASTEXITCODE)." }
    $actual = if ($tool -eq 'go') { ($output -split ' ')[2] -replace '^go', '' } else { "$output".Trim() -replace '^v', '' }
    $expected = $pins.runtime.$tool.version
    if ($actual -ne $expected) { $failures += "$tool version mismatch: expected $expected, found $actual. No automatic installation performed." }
    else { Write-Output "$tool $actual OK" }
}
if ($failures.Count -gt 0) { throw ($failures -join [Environment]::NewLine) }
Write-Output '03-A runtime pins match. PostgreSQL/sqlc/migrate are deferred; no database check was run.'
