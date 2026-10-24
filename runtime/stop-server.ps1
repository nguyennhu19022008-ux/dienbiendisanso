$ErrorActionPreference = "Stop"
$pidFile = Join-Path $PSScriptRoot "server.pid"

if (-not (Test-Path -LiteralPath $pidFile -PathType Leaf)) {
    Write-Host "Website hien khong chay hoac da duoc dung." -ForegroundColor Yellow
    exit 0
}

try {
    $serverPid = [int]([System.IO.File]::ReadAllText($pidFile).Trim())
    $process = Get-Process -Id $serverPid -ErrorAction Stop

    if ($process.ProcessName -notlike "powershell*") {
        throw "PID $serverPid khong phai tien trinh PowerShell."
    }

    Stop-Process -Id $serverPid -Force -ErrorAction Stop
    Write-Host "Da dung website." -ForegroundColor Green
}
catch [Microsoft.PowerShell.Commands.ProcessCommandException] {
    Write-Host "Website da duoc dung truoc do." -ForegroundColor Yellow
}
catch {
    Write-Host "[LOI] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if (Test-Path -LiteralPath $pidFile) {
        try { Remove-Item -LiteralPath $pidFile -Force } catch { }
    }
}
