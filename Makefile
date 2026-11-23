# 统一命令入口：换技术栈只改这里的实现，命令名保持不变。
# Windows 用户请在 Git Bash 或 WSL 中运行 make。

.PHONY: setup dev test lint contract-check check db-migrate

setup:
	@echo "TODO(architect): 安装前后端依赖，例如 cd backend && npm i; cd frontend && npm i"

dev:
	docker compose up

test:
	@echo "TODO(architect): 运行 backend 与 frontend 测试"

lint:
	@echo "TODO(architect): 运行格式化、lint、类型检查"

contract-check:
	npx --yes @redocly/cli lint contracts/openapi.yaml

db-migrate:
	@echo "TODO(db): 例如 dbmate --migrations-dir db/migrations up"

check: lint test contract-check
	@echo "✅ check passed"
