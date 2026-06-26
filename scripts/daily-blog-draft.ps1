# ============================================================
#  매일 밤 D:\BlogMemo 의 공부 메모를 읽어
#  Hugo 블로그 초안(draft)으로 정리해 커밋/푸시한다.
#  Windows 작업 스케줄러가 매일 23:00에 실행.
# ============================================================

$ErrorActionPreference = 'Stop'

$BlogDir   = 'D:\Project\Blog'
$MemoDir   = 'D:\BlogMemo'
$PostsDir  = Join-Path $BlogDir 'content\posts'
$LogFile   = Join-Path $BlogDir 'scripts\daily-blog.log'

function Log($msg) {
  $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  Add-Content -Path $LogFile -Value "[$ts] $msg" -Encoding UTF8
}

try {
  Log "===== 실행 시작 ====="

  # --- PATH 보강 (git 등) ---
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

  # --- claude.exe 위치 자동 탐색 (버전 폴더가 바뀌어도 최신 것 사용) ---
  $ccBase = Join-Path $env:APPDATA 'Claude\claude-code'
  $claude = Get-ChildItem $ccBase -Directory -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            ForEach-Object { Join-Path $_.FullName 'claude.exe' } |
            Where-Object { Test-Path $_ } |
            Select-Object -First 1
  if (-not $claude) { Log "claude.exe 를 찾지 못함. 종료."; exit 1 }
  Log "claude: $claude"

  # --- 메모 파일 수집 (.txt/.md, README 제외) ---
  $memoFiles = Get-ChildItem $MemoDir -File -ErrorAction SilentlyContinue |
               Where-Object { $_.Extension -in '.txt','.md' -and $_.Name -ne 'README.txt' }

  if (-not $memoFiles -or $memoFiles.Count -eq 0) {
    Log "새 메모 없음. 오늘은 글을 만들지 않음. 종료."
    exit 0
  }
  Log "메모 $($memoFiles.Count)개 발견: $($memoFiles.Name -join ', ')"

  # --- 메모 내용 합치기 ---
  $sb = New-Object System.Text.StringBuilder
  foreach ($f in $memoFiles) {
    [void]$sb.AppendLine("----- $($f.Name) -----")
    [void]$sb.AppendLine((Get-Content $f.FullName -Raw -Encoding UTF8))
    [void]$sb.AppendLine("")
  }
  $memoText = $sb.ToString()

  $today = Get-Date -Format 'yyyy-MM-dd'

  # --- 클로드에게 보낼 지시문 ---
  $instr = @"
당신은 한국어 기술 블로그의 편집자입니다.
표준입력으로 들어오는 텍스트는 사용자가 오늘 공부한 메모입니다.
이를 독자가 읽기 좋은 한 편의 블로그 글로 정리하세요.

규칙:
- 출력은 오직 Hugo 마크다운 파일 내용만. 코드펜스(\`\`\`)나 다른 설명을 절대 붙이지 마세요.
- 맨 위에 YAML front matter를 두세요. 형식:
---
title: "메모 내용을 잘 나타내는 자연스러운 한국어 제목"
date: $today
draft: true
tags: ["내용에서 뽑은", "주제 태그 2~4개"]
---
- 본문은 ## 소제목으로 2~4개 섹션으로 구조화하세요.
- 메모가 단편적이면 매끄럽게 잇고 보충 설명을 더하되, 사실을 지어내지는 마세요.
- 어조는 차분하고 명료하게. 분량은 메모 양에 맞춰 적당히.
- 맨 끝에 '## 한 줄 정리' 섹션으로 핵심을 한 문장으로 요약하세요.
"@

  Log "클로드 호출 중..."
  $raw = $memoText | & $claude -p $instr --output-format text
  if ($raw -is [array]) { $raw = $raw -join "`n" }
  $raw = $raw.Trim()

  if ([string]::IsNullOrWhiteSpace($raw)) { Log "클로드 출력이 비어 있음. 종료."; exit 1 }

  # --- 혹시 코드펜스로 감싸져 오면 제거 ---
  $raw = $raw -replace '^\s*```(?:markdown|md)?\s*\r?\n', ''
  $raw = $raw -replace '\r?\n```\s*$', ''

  # --- 안전장치: 반드시 draft: true 로 ---
  if ($raw -match 'draft:\s*false') { $raw = $raw -replace 'draft:\s*false', 'draft: true' }

  # --- 파일 저장 (UTF-8, BOM 없이) ---
  $postPath = Join-Path $PostsDir "$today-study.md"
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($postPath, $raw, $enc)
  Log "초안 저장: $postPath"

  # --- 처리한 메모를 _archive\날짜\ 로 이동 ---
  $archDir = Join-Path $MemoDir "_archive\$today"
  New-Item -ItemType Directory -Force -Path $archDir | Out-Null
  foreach ($f in $memoFiles) { Move-Item $f.FullName (Join-Path $archDir $f.Name) -Force }
  Log "메모 $($memoFiles.Count)개 아카이브로 이동"

  # --- git 커밋 & 푸시 ---
  Set-Location $BlogDir
  git add -A
  git commit -m "공부 초안 추가: $today" | Out-Null
  git push origin main
  Log "git push 완료. (draft 상태라 공개되지 않음)"

  Log "===== 실행 완료 ====="
}
catch {
  Log "오류: $($_.Exception.Message)"
  exit 1
}
