$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$oldToolchain = $env:GOTOOLCHAIN
$reasons = @{
    10 = 'Local .env is invalid or unreadable. Keep its original provisioning keys, including API_PORT=8080; use DALKA_API_PORT separately for the product API.'
    11 = 'Local .env is missing. The user-run database setup must complete first.'
    20 = 'Cannot reach PostgreSQL on 127.0.0.1:5433, or the connection timed out.'
    21 = 'App-role authentication failed. Verify the local app credential and authentication policy; do not supply the postgres password to this checker.'
    22 = 'PostgreSQL refused the connection through another policy or protocol check.'
    23 = 'The target project database does not exist. Setup may be incomplete; do not delete resources or rerun provisioning blindly.'
    24 = 'The app role is not permitted to connect to the target database.'
    30 = 'Wrong PostgreSQL version; exactly 18.6 is required.'
    31 = 'Wrong PostgreSQL port; 5433 is required.'
    32 = 'PostgreSQL listen settings or connected endpoint are not strictly loopback.'
    33 = 'Cannot read PostgreSQL server safety metadata.'
    40 = 'The connected role or database does not match the fixed project identity.'
    41 = 'The app role is not a LOGIN role.'
    42 = 'The app role has an elevated superuser, database, role, replication or RLS-bypass privilege.'
    43 = 'The app role does not own the target project database.'
    44 = 'The app role has an inherited role membership.'
    45 = 'PUBLIC retains CONNECT permission on the target project database.'
    46 = 'Cannot inspect app-role or database permission metadata.'
    47 = 'The read-only SELECT 1 probe failed.'
    99 = 'Unexpected verification failure; raw diagnostics are suppressed.'
}
function Invoke-CheckProcess([string]$File, [string]$Arguments) {
    $taskProcess = New-Object Diagnostics.Process
    try {
        $taskStart = New-Object Diagnostics.ProcessStartInfo
        $taskStart.FileName = $File
        $taskStart.Arguments = $Arguments
        $taskStart.WorkingDirectory = Join-Path $repoRoot 'api'
        $taskStart.UseShellExecute = $false
        $taskStart.CreateNoWindow = $true
        $taskStart.RedirectStandardOutput = $true
        $taskStart.RedirectStandardError = $true
        $taskProcess.StartInfo = $taskStart
        if (-not $taskProcess.Start()) { throw 'process start failed' }
        $taskOut = $taskProcess.StandardOutput.ReadToEndAsync()
        $taskErr = $taskProcess.StandardError.ReadToEndAsync()
        $taskProcess.WaitForExit()
        [void]$taskOut.GetAwaiter().GetResult()
        [void]$taskErr.GetAwaiter().GetResult()
        return $taskProcess.ExitCode
    } finally { $taskProcess.Dispose() }
}
try {
    $env:GOTOOLCHAIN = 'local'
    try {
        $taskGo = (Get-Command go.exe -ErrorAction Stop).Source
        $taskFolder = Join-Path $repoRoot '.local/dbcheck-helper'
        [IO.Directory]::CreateDirectory($taskFolder) | Out-Null
        $taskBuildCode = Invoke-CheckProcess $taskGo 'build -o ../.local/dbcheck-helper/dbcheck.exe ./cmd/dbcheck'
        if ($taskBuildCode -ne 0) { throw 'build failed' }
    } catch { throw '[DBCHECK_BUILD] Go verifier build failed or Go is unavailable. The verifier did not run. Check the pinned Go toolchain and offline build access.' }
    try { $taskCode = Invoke-CheckProcess (Join-Path $taskFolder 'dbcheck.exe') '' }
    catch { throw '[DBCHECK_LAUNCH] Cannot launch the local verifier; raw process output suppressed.' }
    if ($taskCode -ne 0) {
        $taskKind = $taskCode
        $taskTarget = 'dalka_jobs_dev'
        if ($taskCode -ge 120 -and $taskCode -le 199) { $taskKind = $taskCode - 100; $taskTarget = 'dalka_jobs_check' }
        if ($taskCode -eq 10 -or $taskCode -eq 11) { $taskTarget = 'local configuration' }
        $taskReason = if ($reasons.ContainsKey($taskKind)) { $reasons[$taskKind] } else { 'Unknown verifier termination; raw output suppressed.' }
        throw "[dbcheck:$taskCode] $taskTarget - $taskReason"
    }
    Write-Output 'PostgreSQL 18.6 localhost:5433: both project databases verified using dalka_dev only.'
} finally { $env:GOTOOLCHAIN = $oldToolchain }
