param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet("worktree-init", "setup", "dev", "test", "lint", "contract-check", "db-migrate", "check")]
    [string]$Target
)

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
    Write-Error "TODO(architect in T-001): 配置依赖安装命令，例如 pnpm install"
    exit 1
}

function Invoke-Dev {
    docker compose up
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

function Invoke-Test {
    Write-Error "TODO(architect in T-001): 配置测试命令（未配置前禁止假通过）"
    exit 1
}

function Invoke-Lint {
    Write-Error "TODO(architect in T-001): 配置格式化、lint 与类型检查（未配置前禁止假通过）"
    exit 1
}

function Invoke-ContractCheck {
    npx --yes @redocly/cli lint contracts/openapi.yaml
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

function Invoke-DbMigrate {
    Write-Error "TODO(architect/backend): 配置数据库迁移命令"
    exit 1
}

switch ($Target) {
    "worktree-init"  { Invoke-WorktreeInit }
    "setup"          { Invoke-Setup }
    "dev"            { Invoke-Dev }
    "test"           { Invoke-Test }
    "lint"           { Invoke-Lint }
    "contract-check" { Invoke-ContractCheck }
    "db-migrate"     { Invoke-DbMigrate }
    "check"          {
        Invoke-Lint
        Invoke-Test
        Invoke-ContractCheck
        Write-Host "check passed"
    }
}
