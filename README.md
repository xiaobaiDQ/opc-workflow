# OPC 多 Agent 工作流模板

一人公司 + 一支 AI 团队：总经理、架构、后端、前端、数据库、QA 六个角色。流程写在文件里，与工具和技术栈无关。

## 在 Orca 中使用
1. 把本目录初始化为 Git 仓库并在 Orca 中打开。
2. 为每个角色开一个 worktree / agent，开场提示词统一为：
   > 你是本项目的 **<角色>**。先阅读 AGENTS.md 和 roles/<角色>.md，然后到 tasks/board.md 领取分配给你的、依赖已完成的 todo 任务开始工作。
3. 推荐节奏：
   - 先只开 **GM**：和它一起填写 `docs/PRD.md`，让它拆任务。
   - 再开 **architect**：完成技术栈与契约。
   - 然后并行开 **backend / frontend / db**。
   - 最后 **qa** 审查，GM 验收合并。

## 迁移到其他工具
Claude Code 读 `CLAUDE.md`（已指向 AGENTS.md），Codex / Cursor / Antigravity 读 `AGENTS.md`，无需改动。

## 目录
```
AGENTS.md / CLAUDE.md   总规则
roles/                  6 个角色提示词
docs/PRD.md             需求
docs/STACK.md           技术栈（默认 TS + React + Node + PostgreSQL）
docs/decisions/         架构决策记录
tasks/board.md          任务看板
contracts/openapi.yaml  接口契约
db/migrations/          纯 SQL 迁移
Makefile                统一命令入口
```
