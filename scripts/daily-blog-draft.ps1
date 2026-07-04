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

# Send one prompt to claude (headless) and return cleaned Hugo markdown, or
# $null on timeout / empty output. One call = one post, so a multi-memo day
# never merges several memos (and stray commentary) into a single broken file.
function Get-ClaudeDraft($claudeExe, $blogDir, $inputText, $utf8) {
  $pPrompt = 'The input below contains editor instructions (in Korean) followed by study notes. Follow the instructions exactly and output ONLY the resulting Hugo markdown file content.'

  # Feed the (UTF-8) prompt to claude via stdin as RAW BYTES.
  # In PS5.1 `"$str" | & native.exe` re-encodes the string with the console
  # codepage, which turns Korean into '?'. Writing UTF-8 bytes straight to the
  # child's stdin BaseStream bypasses that entirely. stdout/stderr are read
  # asynchronously so a full pipe buffer can't deadlock the write.
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName               = $claudeExe
  $psi.Arguments              = '-p "' + $pPrompt + '" --output-format text'
  $psi.WorkingDirectory       = $blogDir
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

  $inBytes = [System.Text.Encoding]::UTF8.GetBytes($inputText)
  $proc.StandardInput.BaseStream.Write($inBytes, 0, $inBytes.Length)
  $proc.StandardInput.BaseStream.Flush()
  $proc.StandardInput.Close()

  if (-not $proc.WaitForExit(600000)) {
    try { $proc.Kill() } catch {}
    Log "claude timed out after 600s."
    return $null
  }
  $raw     = $outTask.Result
  $errText = $errTask.Result
  if ($errText) { Log ("claude stderr: " + $errText.Trim()) }
  Log "claude exit code: $($proc.ExitCode)"
  $raw = $raw.Trim()
  if ([string]::IsNullOrWhiteSpace($raw)) { return $null }

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

  return $raw
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

    # MSIX-packaged desktop app: AppData\Roaming\Claude is virtualized and
    # invisible to Task Scheduler processes — search the real package path too
    $pkgRoot = Join-Path $u 'AppData\Local\Packages'
    if (Test-Path $pkgRoot) {
      Get-ChildItem $pkgRoot -Directory -Filter 'Claude_*' -ErrorAction SilentlyContinue | ForEach-Object {
        $vccRoot = Join-Path $_.FullName 'LocalCache\Roaming\Claude\claude-code'
        $searched += $vccRoot
        if (Test-Path $vccRoot) {
          Get-ChildItem $vccRoot -Directory -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            ForEach-Object {
              $exe = Join-Path $_.FullName 'claude.exe'
              if (Test-Path $exe) { $candidates.Add($exe) }
            }
        }
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

  $today    = Get-Date -Format 'yyyy-MM-dd'
  $template = Get-Content $PromptFile -Raw -Encoding UTF8
  $archDir  = Join-Path $MemoDir "_archive\$today"

  # One post per memo: a multi-memo day yields several drafts instead of one
  # merged (and easily broken) file. A memo whose claude call fails is left in
  # place so the next run retries it.
  $made = 0
  foreach ($f in $memoFiles) {
    Log ("processing memo: {0}" -f $f.Name)
    $memoText  = Get-Content $f.FullName -Raw -Encoding UTF8
    $fullInput = $template.Replace('{DATE}', $today).Replace('{MEMO}', $memoText)

    $raw = Get-ClaudeDraft $claude $BlogDir $fullInput $utf8
    if ([string]::IsNullOrWhiteSpace($raw)) {
      Log ("claude produced nothing for {0}; leaving memo for retry." -f $f.Name)
      continue
    }

    # Save post (UTF-8, no BOM). Collision-safe: 1st -> DATE-study.md,
    # then DATE-study-2.md, -3.md ... (also covers another PC same day).
    $postPath = Join-Path $PostsDir "$today-study.md"
    $n = 2
    while (Test-Path $postPath) { $postPath = Join-Path $PostsDir "$today-study-$n.md"; $n++ }
    [System.IO.File]::WriteAllText($postPath, $raw, $utf8)
    Log ("draft saved: {0}" -f $postPath)

    # Archive this memo now that its post exists
    New-Item -ItemType Directory -Force -Path $archDir | Out-Null
    Move-Item $f.FullName (Join-Path $archDir $f.Name) -Force
    $made++
  }

  if ($made -eq 0) { Log "no drafts produced. exit."; exit 0 }
  Log ("created {0} draft(s)" -f $made)

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
