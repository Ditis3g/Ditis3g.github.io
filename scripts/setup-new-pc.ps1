# ============================================================
#  새 PC 셋업 스크립트
#  이 저장소를 클론한 뒤 이 파일을 실행하면:
#   1) Hugo(Extended) 설치  2) 테마 서브모듈 초기화
#   3) D:\BlogMemo 폴더 생성  4) 매일 23:00 작업 스케줄러 등록
#  실행:  powershell -ExecutionPolicy Bypass -File .\scripts\setup-new-pc.ps1
# ============================================================

$ErrorActionPreference = 'Stop'
$BlogDir = Split-Path $PSScriptRoot -Parent
$MemoDir = 'D:\BlogMemo'

Write-Host "=== 블로그 자동화 셋업 시작 ($BlogDir) ===" -ForegroundColor Cyan

# PATH 보강
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

# 1) Git 확인
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "[!] Git이 없습니다. 먼저 Git을 설치하세요: winget install Git.Git" -ForegroundColor Red
  exit 1
}
Write-Host "[OK] Git 확인됨"

# 2) Hugo Extended 설치 (없으면)
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
if (-not (Get-Command hugo -ErrorAction SilentlyContinue)) {
  Write-Host "[..] Hugo(Extended) 설치 중..."
  winget install Hugo.Hugo.Extended --accept-source-agreements --accept-package-agreements --disable-interactivity
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
} else {
  Write-Host "[OK] Hugo 이미 설치됨"
}

# 3) 테마 서브모듈 초기화
Write-Host "[..] 테마(PaperMod) 서브모듈 초기화..."
Set-Location $BlogDir
git submodule update --init --recursive
Write-Host "[OK] 테마 준비됨"

# 4) 메모 폴더 생성
New-Item -ItemType Directory -Force -Path $MemoDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $MemoDir '_archive') | Out-Null
Write-Host "[OK] 메모 폴더: $MemoDir"

# 5) 작업 스케줄러 등록 (매일 23:00)
$scriptPath = Join-Path $BlogDir 'scripts\daily-blog-draft.ps1'
$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument "-ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At '23:00'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
  -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'DailyBlogDraft' -Action $action -Trigger $trigger -Settings $settings `
  -Principal $principal -Description '매일 밤 11시 D:\BlogMemo 메모를 블로그 초안으로 정리해 올림' -Force | Out-Null
Write-Host "[OK] 작업 스케줄러 등록됨 (매일 23:00)"

Write-Host ""
Write-Host "=== 셋업 완료! ===" -ForegroundColor Green
Write-Host "남은 일 (한 번만):" -ForegroundColor Yellow
Write-Host "  - 이 PC에서 git push가 처음 실행될 때 GitHub 로그인 창이 뜹니다."
Write-Host "    반드시 'Ditis3g' 계정으로 로그인하세요."
Write-Host "  - 테스트:  D:\BlogMemo 에 메모 .txt 하나 넣고 아래 실행:"
Write-Host "    powershell -ExecutionPolicy Bypass -File `"$scriptPath`""
