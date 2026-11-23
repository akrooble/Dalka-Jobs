$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
# All displayed messages below are fixed text, never raw process/database output.
try { $service = Get-Service -Name 'postgresql-x64-18' -ErrorAction Stop }
catch { throw '[SERVICE_CHECK] Cannot inspect postgresql-x64-18. No setup helper was run.' }
if ($service.Status -ne 'Running') { throw '[SERVICE_STOPPED] postgresql-x64-18 must already be running; setup will not start it.' }
try { $listeners = @(Get-NetTCPConnection -State Listen -ErrorAction Stop | Where-Object LocalPort -eq 5433) }
catch { throw '[LISTENER_CHECK] Cannot inspect Windows listeners. Check Windows permissions.' }
if ($listeners.Count -eq 0) { throw '[PORT_UNREACHABLE] No listener on port 5433.' }
foreach ($listener in $listeners) {
    if ($listener.LocalAddress -notin @('127.0.0.1', '::1')) { throw '[NONLOCAL_LISTENER] Port 5433 has a non-loopback listener. No changes made.' }
}
$envPath = Join-Path $repoRoot '.env'
if (Test-Path -LiteralPath $envPath) { throw '[LOCAL_FILE_EXISTS] Local app credential file already exists; setup will not read, overwrite or rotate it.' }
$reasons = @{
    10 = 'Windows is required.'
    11 = 'Invalid setup request or empty administrative password.'
    12 = 'Setup target path is invalid.'
    13 = 'Local credential file already exists or cannot be inspected; nothing is overwritten.'
    20 = 'Cannot reach local PostgreSQL on the required port, or connection timed out.'
    21 = 'PostgreSQL authentication failed; verify the postgres password and applicable authentication rule.'
    22 = 'PostgreSQL connection was refused by another connection policy or protocol check.'
    30 = 'Wrong PostgreSQL version; exactly 18.6 is required.'
    31 = 'Wrong PostgreSQL port; 5433 is required.'
    32 = 'PostgreSQL listen settings or connected endpoint are not strictly loopback.'
    33 = 'Cannot read PostgreSQL server safety metadata.'
    34 = 'The connection is not the postgres superuser.'
    35 = 'Server password_encryption is not scram-sha-256.'
    36 = 'Cannot inspect authentication policy.'
    37 = 'Authentication configuration contains an invalid rule.'
    38 = 'At least one host authentication rule is not scram-sha-256, including possible unrelated or replication rules.'
    40 = 'Another setup holds the setup lock, or lock acquisition failed.'
    41 = 'Cannot inspect existing project resources.'
    42 = 'Project role or database already exists; setup will not adopt, overwrite or rotate it.'
    50 = 'Secure password or verifier generation failed.'
    51 = 'Cannot exclusively create the local app credential file.'
    52 = 'Cannot restrict the new app credential file to the current Windows user.'
    53 = 'Cannot write or sync the app credential file; preserve any partial file for local recovery.'
    60 = 'Project role creation failed; app credentials may already be saved, so inspect locally before retrying.'
    61 = 'Project database creation failed; partial provisioning may exist.'
    62 = 'Project database connection-permission update failed; a new database remains closed.'
    63 = 'Enabling a configured project database failed; it remains closed.'
    99 = 'Unexpected setup failure; raw diagnostics were suppressed to protect credentials.'
}
$process = $null
$processStarted = $false
$securePassword = $null
$pointer = [IntPtr]::Zero
$oldToolchain = $env:GOTOOLCHAIN
try {
    $env:GOTOOLCHAIN = 'local'
    # Build BEFORE collecting the password; run executable directly to retain exit codes.
    $build = $null
    try {
        $goPath = (Get-Command go.exe -ErrorAction Stop).Source
        $buildDirectory = Join-Path $repoRoot '.local/setup-helper'
        [IO.Directory]::CreateDirectory($buildDirectory) | Out-Null
        $build = New-Object Diagnostics.Process
        $buildInfo = New-Object Diagnostics.ProcessStartInfo
        $buildInfo.FileName = $goPath
        $buildInfo.Arguments = 'build -o ../.local/setup-helper/localsetup.exe ./cmd/localsetup'
        $buildInfo.WorkingDirectory = Join-Path $repoRoot 'api'
        $buildInfo.UseShellExecute = $false
        $buildInfo.CreateNoWindow = $true
        $buildInfo.RedirectStandardOutput = $true
        $buildInfo.RedirectStandardError = $true
        $build.StartInfo = $buildInfo
        if (-not $build.Start()) { throw 'build start failed' }
        $buildOut = $build.StandardOutput.ReadToEndAsync()
        $buildErr = $build.StandardError.ReadToEndAsync()
        $build.WaitForExit()
        if ($build.ExitCode -ne 0) { throw 'build failed' }
    } catch { throw '[GO_BUILD] Go helper build failed or Go is unavailable. No password was requested and no database command was run. Check Go/module access with offline build/vet.' }
    finally { if ($build) { $build.Dispose() } }
    try { $securePassword = Read-Host 'PostgreSQL postgres superuser password (not stored)' -AsSecureString }
    catch { throw '[PASSWORD_PROMPT] Cannot read the hidden password prompt.' }
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    $request = @{ password = $plainPassword; envPath = $envPath } | ConvertTo-Json -Compress
    $start = New-Object Diagnostics.ProcessStartInfo
    $start.FileName = Join-Path $buildDirectory 'localsetup.exe'
    $start.WorkingDirectory = Join-Path $repoRoot 'api'
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardInput = $true
    $start.RedirectStandardOutput = $true
    $start.RedirectStandardError = $true
    $process = New-Object Diagnostics.Process
    $process.StartInfo = $start
    try {
        if (-not $process.Start()) { throw 'helper start failed' }
        $processStarted = $true
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        $process.StandardInput.WriteLine($request)
        $process.StandardInput.Close()
    } catch { throw '[HELPER_PIPE] Cannot launch or send the private setup request to the helper; raw details suppressed.' }
    $plainPassword = $null
    $request = $null
    $process.WaitForExit()
    $code = $process.ExitCode
    if ($code -ne 0) {
        $reason = if ($reasons.ContainsKey($code)) { $reasons[$code] } else { 'Unknown helper termination; raw output suppressed.' }
        throw "[localsetup:$code] $reason No automatic retry or cleanup."
    }
    Write-Output 'Local role and two databases created. App credentials are in private .env. Run scripts/check-db.ps1.'
} finally {
    $plainPassword = $null
    $request = $null
    if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
    if ($securePassword) { $securePassword.Dispose() }
    if ($process) {
        if ($processStarted -and -not $process.HasExited) { $process.Kill() }
        $process.Dispose()
    }
    $env:GOTOOLCHAIN = $oldToolchain
}
