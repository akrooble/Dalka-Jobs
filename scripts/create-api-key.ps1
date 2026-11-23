# Owner-run only. Creates a private 32-byte local API key; never prints its contents.
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskFolder = Join-Path $taskRoot '.local/secrets'
New-Item -ItemType Directory -Force -Path $taskFolder | Out-Null
$taskPath = Join-Path $taskFolder 'api.key'
$taskFile = [IO.File]::Open($taskPath,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
try {
    $taskSid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
    $taskAclResult = & icacls.exe $taskPath '/inheritance:r' '/grant:r' ('*' + $taskSid + ':(F)') 2>&1
    if ($LASTEXITCODE -ne 0) { throw 'Key ACL setup failed. Empty file preserved; no key written.' }
    $taskBytes = New-Object byte[] 32
    $taskRandom = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $taskRandom.GetBytes($taskBytes); $taskFile.Write($taskBytes,0,32); $taskFile.Flush($true) }
    finally { [Array]::Clear($taskBytes,0,32); $taskRandom.Dispose() }
} finally { $taskFile.Dispose() }
Write-Host 'Private API key created. Never share or commit it; keep its protected backup separately.'
