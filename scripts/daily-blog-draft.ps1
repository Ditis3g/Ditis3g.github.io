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

  # Locate claude.exe. Two install flavors exist on this machine:
  #   1) npm global:        %APPDATA%\npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe
  #   2) Claude Desktop:    %APPDATA%\Claude\claude-code\<version>\claude.exe
  # Try PATH first (handles either), then explicit per-user fallbacks. Scan
  # every user profile under C:\Users in case a scheduled task runs without
  # the expected APPDATA/USERPROFILE.
  Log "env APPDATA=$env:APPDATA USERPROFILE=$env:USERPROFILE"
  $candidates = New-Object System.Collections.Generic.List[string]

  $cmd = Get-Command claude -ErrorAction SilentlyContinue
  if ($cmd) {
    if ($cmd.Source -like '*.exe') {
      $candidates.Add($cmd.Source)
    } else {
      # .cmd / .ps1 shim — resolve to the real exe next to its node_modules
      $real = Join-Path (Split-Path $cmd.Source -Parent) 'node_modules\@anthropic-ai\claude-code\bin\claude.exe'
      if (Test-Path $real) { $candidates.Add($real) }
    }
  }

  $userRoots = @()
  if ($env:USERPROFILE) { $userRoots += $env:USERPROFILE }
  $userRoots += Get-ChildItem 'C:\Users' -Directory -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
  $userRoots = $userRoots | Sort-Object -Unique

  $searched = @()
  foreach ($u in $userRoots) {
    $npmExe = Join-Path $u 'AppData\Roaming\npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe'
    $searched += $npmExe
    if (Test-Path $npmExe) { $candidates.Add($npmExe) }

    $ccRoot = Join-Path $u 'AppData\Roaming\Claude\claude-code'
    $searched += $ccRoot
    if (Test-Path $ccRoot) {
      Get-ChildItem $ccRoot -Directory -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        ForEach-Object {
          $exe = Join-Path $_.FullName 'claude.exe'
          if (Test-Path $exe) { $candidates.Add($exe) }
        }
    }
  }

  $claude = $candidates | Select-Object -First 1
  if (-not $claude) { Log "claude.exe not found (searched: $($searched -join '; ')). exit."; exit 1 }
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

  # Feed the (UTF-8) prompt to claude via stdin as RAW BYTES.
  # In PS5.1 `"$str" | & native.exe` re-encodes the string with the console
  # codepage, which turns Korean into '?'. Writing UTF-8 bytes straight to the
  # child's stdin BaseStream bypasses that entirely. stdout/stderr are read
  # asynchronously so a full pipe buffer can't deadlock the write.
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName               = $claude
  $psi.Arguments              = '-p "' + $pPrompt + '" --output-format text'
  $psi.WorkingDirectory       = $BlogDir
  $psi.UseShellExecute        = $false
  $psi.CreateNoWindow         = $true
  $psi.RedirectStandardInput  = $true
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError  = $true
  $psi.StandardOutputEncoding = $utf8
  $psi.StandardErrorEncoding  = $utf8

  $proc    = [System.Diagnostics.Process]::Start($psi)
  $outTask = $proc.StandardOutput.ReadToEndAsync()
  $errTask = $proc.StandardError.ReadToEndAsync()

  $inBytes = [System.Text.Encoding]::UTF8.GetBytes($fullInput)
  $proc.StandardInput.BaseStream.Write($inBytes, 0, $inBytes.Length)
  $proc.StandardInput.BaseStream.Flush()
  $proc.StandardInput.Close()

  if (-not $proc.WaitForExit(600000)) {
    try { $proc.Kill() } catch {}
    Log "claude timed out after 600s. exit."; exit 1
  }
  $raw     = $outTask.Result
  $errText = $errTask.Result
  if ($errText) { Log ("claude stderr: " + $errText.Trim()) }
  Log "claude exit code: $($proc.ExitCode)"
  $raw = $raw.Trim()

  if ([string]::IsNullOrWhiteSpace($raw)) { Log "claude returned empty. exit."; exit 1 }

  # Strip code fences if the model wrapped output
  $raw = $raw -replace '^\s*```(?:markdown|md)?\s*\r?\n', ''
  $raw = $raw -replace '\r?\n```\s*$', ''

  # Strip any chatty preamble (or stray separators / inner code fences) before
  # the Hugo front matter. We require the delimiter to be IMMEDIATELY followed
  # by a YAML key line (e.g. `title:`) so a lone `---` separator isn't mistaken
  # for the front matter open.
  $fmStart = [regex]::Match($raw, '(?ms)^(---|\+\+\+)\s*\r?\n[a-zA-Z_][a-zA-Z0-9_-]*\s*:')
  if ($fmStart.Success) {
    if ($fmStart.Index -gt 0) { $raw = $raw.Substring($fmStart.Index).Trim() }
  } else {
    # Fall back to the old behavior so a malformed-but-present front matter
    # still gets a chance at trimming chatty preamble.
    $loose = [regex]::Match($raw, '(?m)^(---|\+\+\+)\s*$')
    if ($loose.Success -and $loose.Index -gt 0) {
      $raw = $raw.Substring($loose.Index).Trim()
    }
  }

  # Also strip an inner ```markdown fence the model may have placed RIGHT AFTER
  # the (now-leading) front matter open — i.e. `---\n```markdown\n---\n...`.
  $raw = $raw -replace '^(---|\+\+\+)\s*\r?\n\s*```(?:markdown|md)?\s*\r?\n(---|\+\+\+)', '$1'

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
