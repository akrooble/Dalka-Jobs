# Owner may rerun on a fresh checkout. Tools stay in the ignored workspace directory.
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskFolder = Join-Path $taskRoot '.tools/first-five'
New-Item -ItemType Directory -Force -Path $taskFolder | Out-Null
$taskTools = @(
    @{Name='sqlc';Version='v1.31.1';Url='https://github.com/sqlc-dev/sqlc/releases/download/v1.31.1/sqlc_1.31.1_windows_amd64.zip';SHA='352711fa7dcb05dcdfefca0ad71b2c9a74fd090f8d7fc609419de4cbc725429f'},
    @{Name='migrate';Version='4.20.1';Url='https://github.com/golang-migrate/migrate/releases/download/v4.20.1/migrate.windows-amd64.zip';SHA='bf68e2fdd1c8efd3cac59c6cb4cddca51546c402e3fc616172329d7686875ce8'}
)
foreach ($taskTool in $taskTools) {
    $taskZip = Join-Path $taskFolder ($taskTool.Name + '.zip')
    $taskExtract = Join-Path $taskFolder $taskTool.Name
    if (-not (Test-Path -LiteralPath $taskZip)) { Invoke-WebRequest -UseBasicParsing -Uri $taskTool.Url -OutFile $taskZip }
    if ((Get-FileHash -LiteralPath $taskZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskTool.SHA) { throw 'Tool archive publisher checksum mismatch; nothing is extracted.' }
    if (-not (Test-Path -LiteralPath $taskExtract)) { Expand-Archive -LiteralPath $taskZip -DestinationPath $taskExtract }
    $taskBinary = Join-Path $taskExtract ($taskTool.Name + '.exe')
    $taskFlag = 'version'; if ($taskTool.Name -eq 'migrate') { $taskFlag = '-version' }
    $taskReported = (& $taskBinary $taskFlag 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $taskReported -ne $taskTool.Version) { throw 'Existing tool version differs from the approved pin; files were not overwritten.' }
    Write-Host ($taskTool.Name + ' verified: ' + $taskTool.Version)
}
