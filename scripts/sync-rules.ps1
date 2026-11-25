param(
    [string]$Source = $env:OPC_RULES_REPO
)

# 从通用编码规范库同步只读快照到 docs/rules/。
# 本文件必须保持 UTF-8 带 BOM。快照只读，不得手改；更新请重新运行本脚本并提交。
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Source)) {
    Write-Host "请通过 -Source <规范库本地路径> 传参，或先设置环境变量 OPC_RULES_REPO。" -ForegroundColor Red
    exit 1
}

$root = Split-Path -Parent $PSScriptRoot
$dest = Join-Path $root "docs\rules"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

if (-not (Test-Path (Join-Path $Source ".git"))) { throw "规范库不是 git 仓库或路径不存在: $Source" }
$commit = (git -C $Source rev-parse --short HEAD).Trim()
$dirty = [bool](git -C $Source status --porcelain)
$stamp = Get-Date -Format "yyyy-MM-dd"
$dirtyNote = ""
if ($dirty) { $dirtyNote = "（规范库工作区有未提交改动，快照可能与该提交不一致）" }

$files = @(
    @{ From = "coding\PRINCIPLES.md";        To = "PRINCIPLES.md" },
    @{ From = "coding\WORKFLOW.md";          To = "WORKFLOW.md" },
    @{ From = "coding\RESEARCH.md";          To = "RESEARCH.md" },
    @{ From = "templates\docs\HANDOVER.md";  To = "HANDOVER.md" }
)

$utf8 = New-Object System.Text.UTF8Encoding($false)
foreach ($f in $files) {
    $src = Join-Path $Source $f.From
    $body = [IO.File]::ReadAllText($src, $utf8) -replace "`r`n", "`n"
    $header = "> **只读快照**：来源 ``$src``，commit ``$commit``，同步于 $stamp。$dirtyNote`n" +
              "> 不得手改，更新请运行 ``scripts/sync-rules.ps1``。本项目 ``AGENTS.md`` 与本文件冲突时**以 AGENTS.md 为准**；" +
              "文中『等用户确认』『合并主干单独确认』等条款已由 AGENTS.md 第 3 节映射为 GM/老板分层确认。`n`n"
    [IO.File]::WriteAllText((Join-Path $dest $f.To), $header + $body, $utf8)
    Write-Host "synced $($f.To) @ $commit"
}
