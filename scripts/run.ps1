param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet("worktree-init", "setup", "dev", "quick", "test", "lint", "retest", "contract-check", "db-migrate", "check")]
    [string]$Target
)

# 注意：本文件必须保持 UTF-8 带 BOM，否则 Windows PowerShell 5.1 会解析失败。
# 与 Makefile 是同一套命令的两份实现，修改必须同步。分层定义见 AGENTS.md 第 5 节。
$ErrorActionPreference = "Stop"

function Invoke-WorktreeInit {
    if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example"
    }
    if (Test-Path ".scaffold-ready") {
        Invoke-Setup
    } else {
        Write-Host "[skip] 脚手架尚未完成(无 .scaffold-ready)，跳过依赖安装。T-001 完成时由 architect 创建该标记。"
    }
}

function Invoke-Setup {
    Write-Host "TODO(architect in T-001): 配置依赖安装命令，例如 pnpm install" -ForegroundColor Red
    exit 1
}

function Invoke-Dev {
    Write-Host "TODO(architect in T-001): 配置本地开发启动命令，例如 docker compose up" -ForegroundColor Red
    exit 1
}

# 快测（秒级）：类型检查 + lint + 与改动相关的单测。
function Invoke-Quick {
    Write-Host "TODO(architect in T-001): 配置快测命令（未配置前禁止假通过）" -ForegroundColor Red
    exit 1
}

function Invoke-Test {
    Write-Host "TODO(architect in T-001): 配置全量测试命令（未配置前禁止假通过）" -ForegroundColor Red
    exit 1
}

function Invoke-Lint {
    Write-Host "TODO(architect in T-001): 配置格式化、lint 与类型检查（未配置前禁止假通过）" -ForegroundColor Red
    exit 1
}

# 重测：E2E / 集成 / 冒烟。
function Invoke-Retest {
    Write-Host "TODO(architect in T-001): 配置 E2E/集成/冒烟命令（未配置前禁止假通过）" -ForegroundColor Red
    exit 1
}

function Invoke-ContractCheck {
    npx --yes @redocly/cli@1.34.5 lint contracts/openapi.yaml
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

function Invoke-DbMigrate {
    Write-Host "TODO(architect/backend): 配置数据库迁移命令" -ForegroundColor Red
    exit 1
}

switch ($Target) {
    "worktree-init"  { Invoke-WorktreeInit }
    "setup"          { Invoke-Setup }
    "dev"            { Invoke-Dev }
    "quick"          { Invoke-Quick }
    "test"           { Invoke-Test }
    "lint"           { Invoke-Lint }
    "retest"         { Invoke-Retest }
    "contract-check" { Invoke-ContractCheck }
    "db-migrate"     { Invoke-DbMigrate }
    "check" {
        # 合并门禁
        Invoke-Lint
        Invoke-Test
        Invoke-ContractCheck
        Write-Host "check passed"
    }
}
