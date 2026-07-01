# ============================================================
#  Daily blog pull
#  Pulls the latest blog repo from GitHub (multi-PC sync).
#  Run by Windows Task Scheduler every day at 11:20.
#  Kept ASCII-only to avoid PS5.1 encoding bugs.
# ============================================================

$ErrorActionPreference = 'Stop'

$BlogDir = Split-Path $PSScriptRoot -Parent      # repo location (works wherever cloned)
$LogFile = Join-Path $BlogDir 'scripts\daily-blog.log'

function Log($msg) {
  $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  Add-Content -Path $LogFile -Value "[$ts] pull: $msg" -Encoding UTF8
}

try {
  Log "===== pull start ====="

  # Augment PATH so git is found under the scheduler's context
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

  Set-Location $BlogDir
  git pull --rebase origin main | Out-Null
  Log "git pull done"

  Log "===== pull done ====="
}
catch {
  Log "ERROR: $($_.Exception.Message)"
  exit 1
}
