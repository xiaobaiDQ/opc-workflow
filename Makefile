# 统一命令入口：换技术栈只改此文件与 scripts/run.ps1 的实现，命令名保持不变。
# 注意：Makefile 与 scripts/run.ps1 是同一套命令的两份实现（Unix / Windows），
#       修改任何命令时必须【同时】修改两个文件，并在 PR/任务卡中注明。
# Windows PowerShell 若无 make，请直接运行: ./scripts/run.ps1 <target>

.PHONY: worktree-init setup dev test lint contract-check check db-migrate

# 新 Worktree 初始化：先准备 .env；脚手架完成前（无 .scaffold-ready 标记）只提示、不安装依赖。
worktree-init:
	@if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	@if [ -f .scaffold-ready ]; then $(MAKE) setup; else echo "[skip] 脚手架尚未完成(无 .scaffold-ready)，跳过依赖安装。T-001 完成时由 architect 创建该标记。"; fi

setup:
	@echo "TODO(architect in T-001): 配置依赖安装命令，例如 pnpm install"
	@exit 1

dev:
	docker compose up

test:
	@echo "TODO(architect in T-001): 配置测试命令（未配置前禁止假通过）"
	@exit 1

lint:
	@echo "TODO(architect in T-001): 配置格式化、lint 与类型检查（未配置前禁止假通过）"
	@exit 1

contract-check:
	npx --yes @redocly/cli lint contracts/openapi.yaml

db-migrate:
	@echo "TODO(architect/backend): 配置数据库迁移命令"
	@exit 1

check: lint test contract-check
	@echo "check passed"
