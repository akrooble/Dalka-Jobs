param(
    [ValidateSet('bootstrap','provision','reset')][string]$Action = 'bootstrap',
    [Parameter(Mandatory=$true)][string]$Email,
    [ValidateSet('recruiter','company_admin')][string]$Role = 'recruiter',
    [string]$CompanyId = ''
)
# Owner-run only. Compiles before prompting; secrets travel exclusively through child stdin.
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskOutput = Join-Path $taskRoot '.local/admin'
New-Item -ItemType Directory -Force -Path $taskOutput | Out-Null
$taskBinary = Join-Path $taskOutput 'admin.exe'
Push-Location (Join-Path $taskRoot 'api')
try {
    $taskBuild = & go build -o $taskBinary ./cmd/admin 2>&1
    if ($LASTEXITCODE -ne 0) { throw 'Administrative helper build failed before credential input.' }
    $taskConfirmation = ''
    if ($Action -eq 'reset') {
        Write-Host 'Reset revokes sessions and recovery codes and requires fresh authenticator enrollment. Verify the account owner before proceeding.'
        $taskConfirmation = Read-Host ('Type RESET ' + $Email.ToLowerInvariant().Trim() + ' to confirm')
        if ($taskConfirmation -ne ('RESET ' + $Email.ToLowerInvariant().Trim())) { throw 'Reset not confirmed.' }
    }
    $taskSecret = Read-Host 'New account password (15-128 characters; never shared with the agent)' -AsSecureString
    $taskPointer = [IntPtr]::Zero
    try {
        $taskPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecret)
        $taskPlain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPointer)
        $taskRequest = @{action=$Action;email=$Email;password=$taskPlain;role=$Role;companyId=$CompanyId;confirmation=$taskConfirmation} | ConvertTo-Json -Compress
        $taskStart = New-Object System.Diagnostics.ProcessStartInfo
        $taskStart.FileName = $taskBinary
        $taskStart.WorkingDirectory = Join-Path $taskRoot 'api'
        $taskStart.UseShellExecute = $false
        $taskStart.CreateNoWindow = $true
        $taskStart.RedirectStandardInput = $true
        $taskStart.RedirectStandardOutput = $true
        $taskStart.RedirectStandardError = $true
        $taskProcess = New-Object System.Diagnostics.Process
        $taskProcess.StartInfo = $taskStart
        [void]$taskProcess.Start()
        $taskStdout = $taskProcess.StandardOutput.ReadToEndAsync()
        $taskStderr = $taskProcess.StandardError.ReadToEndAsync()
        $taskProcess.StandardInput.WriteLine($taskRequest)
        $taskProcess.StandardInput.Close()
        $taskProcess.WaitForExit()
        [void]$taskStdout.GetAwaiter().GetResult()
        [void]$taskStderr.GetAwaiter().GetResult()
        if ($taskProcess.ExitCode -ne 0) { throw 'Administrative operation refused; review configuration and account state locally.' }
        Write-Host 'Account operation completed. Sign in and enroll an authenticator.'
    } finally {
        if ($taskPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPointer) }
        $taskPlain = $null; $taskRequest = $null
        if ($null -ne $taskSecret) { $taskSecret.Dispose() }
    }
} finally { Pop-Location }
