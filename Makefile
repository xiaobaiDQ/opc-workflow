# 统一命令入口：换技术栈只改此文件与 scripts/run.ps1 的实现，命令名保持不变。
# 注意：Makefile 与 scripts/run.ps1 是同一套命令的两份实现（Unix / Windows），
#       修改任何命令时必须【同时】修改两个文件。分层定义见 AGENTS.md 第 5 节。
# Windows PowerShell 若无 make，请直接运行: ./scripts/run.ps1 <target>

.PHONY: worktree-init worktree-check setup dev quick test lint retest contract-check prd-check check db-migrate

# 新 Worktree 初始化：先准备 .env；脚手架完成前（无 .scaffold-ready 标记）只提示、不安装依赖。
worktree-init:
	@if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	@if [ -f .scaffold-ready ]; then $(MAKE) setup; else echo "[skip] 脚手架尚未完成(无 .scaffold-ready)，跳过依赖安装。T-001 完成时由 architect 创建该标记。"; fi

worktree-check:
	node scripts/check-worktree.mjs $(NAME)

setup:
	@echo "TODO(architect in T-001): 配置依赖安装命令，例如 pnpm install"
	@exit 1

dev:
	@echo "TODO(architect in T-001): 配置本地开发启动命令，例如 docker compose up"
	@exit 1

# 快测（秒级）：类型检查 + lint + 与改动相关的单测。编码途中每次改完跑这个。
quick:
	@echo "TODO(architect in T-001): 配置快测命令（未配置前禁止假通过）"
	@exit 1

test:
	@echo "TODO(architect in T-001): 配置全量测试命令（未配置前禁止假通过）"
	@exit 1

lint:
	@echo "TODO(architect in T-001): 配置格式化、lint 与类型检查（未配置前禁止假通过）"
	@exit 1

# 重测：E2E / 集成 / 冒烟。红灯任务与阶段收尾时跑。
retest:
	@echo "TODO(architect in T-001): 配置 E2E/集成/冒烟命令（未配置前禁止假通过）"
	@exit 1

contract-check:
	npx --yes @redocly/cli@1.34.5 lint contracts/openapi.yaml

prd-check:
	node scripts/validate-prd.mjs docs/PRD.md

db-migrate:
	@echo "TODO(architect/backend): 配置数据库迁移命令"
	@exit 1

# 合并门禁：标 review 前、合并前必须通过。
check: lint test contract-check
	@echo "check passed"
