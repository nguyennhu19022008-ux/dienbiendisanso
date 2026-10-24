param(
    [string]$Root = (Join-Path $PSScriptRoot ".."),
    [int]$PreferredPort = 8787
)

$ErrorActionPreference = "Stop"
$rootPath = [System.IO.Path]::GetFullPath($Root)
$indexPath = Join-Path $rootPath "index.html"
$pidFile = Join-Path $PSScriptRoot "server.pid"
$listener = $null

function Send-Response {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$Reason,
        [string]$ContentType,
        [byte[]]$Body,
        [bool]$HeadOnly = $false,
        [string]$ExtraHeaders = ""
    )

    $header = "HTTP/1.1 $StatusCode $Reason`r`n" +
              "Content-Type: $ContentType`r`n" +
              "Content-Length: $($Body.Length)`r`n" +
              "X-Content-Type-Options: nosniff`r`n" +
              "Referrer-Policy: strict-origin-when-cross-origin`r`n" +
              $ExtraHeaders +
              "Connection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if (-not $HeadOnly -and $Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
    $Stream.Flush()
}

function Get-ContentType {
    param([string]$Path)

    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".js"   { return "text/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".svg"  { return "image/svg+xml" }
        ".webp" { return "image/webp" }
        ".png"  { return "image/png" }
        ".jpg"  { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".gif"  { return "image/gif" }
        ".ico"  { return "image/x-icon" }
        ".woff" { return "font/woff" }
        ".woff2" { return "font/woff2" }
        default  { return "application/octet-stream" }
    }
}

try {
    if (-not (Test-Path -LiteralPath $indexPath -PathType Leaf)) {
        throw "Khong tim thay website\index.html. Hay giai nen day du goi ZIP."
    }

    for ($port = $PreferredPort; $port -le ($PreferredPort + 20); $port++) {
        try {
            $candidate = [System.Net.Sockets.TcpListener]::new(
                [System.Net.IPAddress]::Loopback,
                $port
            )
            $candidate.Start()
            $listener = $candidate
            break
        }
        catch {
            if ($candidate) {
                try { $candidate.Stop() } catch { }
            }
        }
    }

    if ($null -eq $listener) {
        throw "Khong tim duoc cong trong tu $PreferredPort den $($PreferredPort + 20)."
    }

    [System.IO.File]::WriteAllText(
        $pidFile,
        $PID.ToString(),
        [System.Text.Encoding]::ASCII
    )

    $activePort = ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port
    $url = "http://127.0.0.1:$activePort/"

    Clear-Host
    Write-Host "============================================================" -ForegroundColor DarkYellow
    Write-Host "  DIEN BIEN 3D STEAM - WEBSITE DANG CHAY" -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor DarkYellow
    Write-Host ""
    Write-Host "Dia chi: $url" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Khong dong cua so nay khi dang xem website."
    Write-Host "De dung: nhan Ctrl+C, dong cua so, hoac chay STOP-WEBSITE.bat."
    Write-Host ""

    Start-Sleep -Milliseconds 700
    try {
        Start-Process $url
    }
    catch {
        Write-Host "Khong the tu mo trinh duyet. Hay mo thu cong dia chi tren." -ForegroundColor Yellow
    }

    $rootPrefix = $rootPath.TrimEnd([char[]]"\/") + [System.IO.Path]::DirectorySeparatorChar

    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $client.ReceiveTimeout = 10000
            $client.SendTimeout = 10000
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new(
                $stream,
                [System.Text.Encoding]::ASCII,
                $false,
                4096,
                $true
            )

            $requestLine = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                continue
            }

            while ($true) {
                $line = $reader.ReadLine()
                if ([string]::IsNullOrEmpty($line)) { break }
            }

            $parts = $requestLine.Split(' ')
            if ($parts.Length -lt 2) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
                Send-Response $stream 400 "Bad Request" "text/plain; charset=utf-8" $body
                continue
            }

            $method = $parts[0].ToUpperInvariant()
            $headOnly = $method -eq "HEAD"
            if ($method -ne "GET" -and -not $headOnly) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
                Send-Response $stream 405 "Method Not Allowed" "text/plain; charset=utf-8" $body $false "Allow: GET, HEAD`r`n"
                continue
            }

            $requestTarget = $parts[1].Split('?')[0]
            $urlPath = [System.Uri]::UnescapeDataString($requestTarget)
            if ($urlPath.Contains("\")) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
                Send-Response $stream 403 "Forbidden" "text/plain; charset=utf-8" $body $headOnly
                continue
            }

            $relativePath = $urlPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            if ([string]::IsNullOrWhiteSpace($relativePath)) {
                $relativePath = "index.html"
            }

            $fullPath = [System.IO.Path]::GetFullPath((Join-Path $rootPath $relativePath))
            $isInsideRoot = $fullPath.Equals($rootPath, [System.StringComparison]::OrdinalIgnoreCase) -or
                            $fullPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)

            if (-not $isInsideRoot) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
                Send-Response $stream 403 "Forbidden" "text/plain; charset=utf-8" $body $headOnly
                continue
            }

            if (Test-Path -LiteralPath $fullPath -PathType Container) {
                $fullPath = Join-Path $fullPath "index.html"
            }

            if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
                if ([string]::IsNullOrEmpty([System.IO.Path]::GetExtension($fullPath))) {
                    $fullPath = $indexPath
                }
                else {
                    $body = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
                    Send-Response $stream 404 "Not Found" "text/plain; charset=utf-8" $body $headOnly
                    continue
                }
            }

            $body = [System.IO.File]::ReadAllBytes($fullPath)
            $contentType = Get-ContentType $fullPath
            $cacheHeader = if ($contentType.StartsWith("text/html")) {
                "Cache-Control: no-cache`r`n"
            }
            else {
                "Cache-Control: public, max-age=3600`r`n"
            }
            Send-Response $stream 200 "OK" $contentType $body $headOnly $cacheHeader
        }
        catch {
            try {
                if ($stream) {
                    $body = [System.Text.Encoding]::UTF8.GetBytes("Internal Server Error")
                    Send-Response $stream 500 "Internal Server Error" "text/plain; charset=utf-8" $body
                }
            }
            catch { }
        }
        finally {
            if ($reader) { $reader.Dispose() }
            if ($stream) { $stream.Dispose() }
            $client.Close()
            $reader = $null
            $stream = $null
        }
    }
}
catch {
    Write-Host ""
    Write-Host "[LOI] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if ($listener) {
        try { $listener.Stop() } catch { }
    }
    if (Test-Path -LiteralPath $pidFile) {
        try { Remove-Item -LiteralPath $pidFile -Force } catch { }
    }
}
