# ============================================================
#  Daily blog draft generator
#  Reads study memos from D:\blog-memo, asks Claude (headless)
#  to turn them into a Hugo draft post, commits & pushes.
#  Run by Windows Task Scheduler every day at 23:00.
#  NOTE: Korean instructions live in prompt-instructions.txt
#        so this .ps1 stays ASCII-only (avoids PS5.1 encoding bugs).
# ============================================================

$ErrorActionPreference = 'Stop'

$BlogDir    = Split-Path $PSScriptRoot -Parent   # repo location (works wherever cloned)
$MemoDir    = 'D:\blog-memo'
$PostsDir   = Join-Path $BlogDir 'content\posts'
$PromptFile = Join-Path $BlogDir 'scripts\prompt-instructions.txt'
$LogFile    = Join-Path $BlogDir 'scripts\daily-blog.log'

function Log($msg) {
  $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  Add-Content -Path $LogFile -Value "[$ts] $msg" -Encoding UTF8
}

try {
  Log "===== run start ====="

  # Force UTF-8 so Korean piped to claude.exe is not mangled
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  $OutputEncoding = $utf8
  try { [Console]::OutputEncoding = $utf8 } catch {}

  # Augment PATH (git etc.)
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

  # Locate claude.exe (newest version folder, robust to updates)
  $ccBase = Join-Path $env:APPDATA 'Claude\claude-code'
  $claude = Get-ChildItem $ccBase -Directory -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            ForEach-Object { Join-Path $_.FullName 'claude.exe' } |
            Where-Object { Test-Path $_ } |
            Select-Object -First 1
  if (-not $claude) { Log "claude.exe not found. exit."; exit 1 }
  Log "claude: $claude"

  # Pull latest first (safe for multi-PC: another PC may have pushed)
  Set-Location $BlogDir
  git pull --rebase origin main | Out-Null
  Log "git pull done"

  # Collect memo files (.txt/.md, exclude README)
  $memoFiles = Get-ChildItem $MemoDir -File -ErrorAction SilentlyContinue |
               Where-Object { $_.Extension -in '.txt','.md' -and $_.Name -ne 'README.txt' }

  if (-not $memoFiles -or $memoFiles.Count -eq 0) {
    Log "no new memo. skip today. exit."
    exit 0
  }
  Log ("found {0} memo file(s): {1}" -f $memoFiles.Count, ($memoFiles.Name -join ', '))

  # Concatenate memo contents (read as UTF-8)
  $sb = New-Object System.Text.StringBuilder
  foreach ($f in $memoFiles) {
    [void]$sb.AppendLine("----- $($f.Name) -----")
    [void]$sb.AppendLine((Get-Content $f.FullName -Raw -Encoding UTF8))
    [void]$sb.AppendLine("")
  }
  $memoText = $sb.ToString()

  $today = Get-Date -Format 'yyyy-MM-dd'

  # Build full prompt from the (UTF-8) instruction template
  $template = Get-Content $PromptFile -Raw -Encoding UTF8
  $fullInput = $template.Replace('{DATE}', $today).Replace('{MEMO}', $memoText)

  Log "calling claude..."
  $pPrompt = 'The input below contains editor instructions (in Korean) followed by study notes. Follow the instructions exactly and output ONLY the resulting Hugo markdown file content.'
  $raw = $fullInput | & $claude -p $pPrompt --output-format text
  if ($raw -is [array]) { $raw = $raw -join "`n" }
  $raw = $raw.Trim()

  if ([string]::IsNullOrWhiteSpace($raw)) { Log "claude returned empty. exit."; exit 1 }

  # Strip code fences if the model wrapped output
  $raw = $raw -replace '^\s*```(?:markdown|md)?\s*\r?\n', ''
  $raw = $raw -replace '\r?\n```\s*$', ''

  # Strip any chatty preamble before the Hugo front matter delimiter
  # (model sometimes prepends "I'll follow the instructions..."). Hugo needs
  # the front matter (--- or +++) on the very first line.
  $fmStart = [regex]::Match($raw, '(?m)^(---|\+\+\+)\s*$')
  if ($fmStart.Success -and $fmStart.Index -gt 0) {
    $raw = $raw.Substring($fmStart.Index).Trim()
  }

  # Safety: ensure draft stays true
  if ($raw -match 'draft:\s*false') { $raw = $raw -replace 'draft:\s*false', 'draft: true' }

  # Save post (UTF-8, no BOM). Avoid filename collision (e.g. another PC same day).
  $postPath = Join-Path $PostsDir "$today-study.md"
  $n = 2
  while (Test-Path $postPath) { $postPath = Join-Path $PostsDir "$today-study-$n.md"; $n++ }
  [System.IO.File]::WriteAllText($postPath, $raw, $utf8)
  Log "draft saved: $postPath"

  # Archive processed memos to _archive\DATE\
  $archDir = Join-Path $MemoDir "_archive\$today"
  New-Item -ItemType Directory -Force -Path $archDir | Out-Null
  foreach ($f in $memoFiles) { Move-Item $f.FullName (Join-Path $archDir $f.Name) -Force }
  Log ("archived {0} memo file(s)" -f $memoFiles.Count)

  # Commit & push (draft -> not published publicly)
  Set-Location $BlogDir
  git add -A
  git commit -m "study draft: $today" | Out-Null
  git pull --rebase origin main | Out-Null
  git push origin main
  Log "git push done (draft, not public)."

  Log "===== run done ====="
}
catch {
  Log "ERROR: $($_.Exception.Message)"
  exit 1
}
