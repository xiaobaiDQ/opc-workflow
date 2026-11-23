# OPC 多 Agent 工作流模板（Orca + OpenCode）

一人公司（OPC）+ 一支按需调度的 AI 团队：**GM、Architect、Backend（含 DB）、Frontend、QA** 五个角色。

> **所有规则只在 [AGENTS.md](AGENTS.md) 定义**（风险分级、授权、熔断、缺陷修复、红线、验证分层、高危/禁改）。本文件只讲怎么用，不重复规则。

## 两层结构
- **编排层**：本仓库 `AGENTS.md`、`roles/`、`tasks/` —— 谁做、怎么交接、用什么模型、谁确认。
- **执行层**：`docs/rules/` —— 来自你的 vibcoding 规范库的只读快照（编码原则、选型查证、改动分级背景、交接模板）。用 `scripts/sync-rules.ps1` 从规范库更新，头部记录来源与提交号，冲突以 `AGENTS.md` 为准。

## 在 Orca 中的运转节奏
0. **模型映射（GM，一次）**：`opencode models`，按 `docs/MODELS.md` 填三档。
1. **规划（GM）**：和你对齐 `docs/PRD.md`；拆任务、给每个任务定风险等级与模型档位。开场词：
   > 你是本项目的 **gm**。先读 `AGENTS.md` 和 `roles/gm.md`，和我一起确认 `docs/PRD.md`，然后拆任务写入 `tasks/board.md` 与 `tasks/T-XXX.md`，为每个任务定风险等级、模型档位和启动指令。
2. **底座（Architect）**：脚手架 T-001 与契约，合入 `main` 后才能并行。
3. **并行编码**：从最新 `main` 为每个任务开 Worktree，运行 `make worktree-init`（Windows：`./scripts/run.ps1 worktree-init`），把任务卡第 1 节的启动指令复制进 OpenCode 终端。
4. **审查与合并**：QA 写结论，GM 复核等级。**绿灯 GM 直接合并并事后汇报；黄/红灯由你单独确认才合并。**

> 绿灯小改动可免任务卡，走临时分支（见 `AGENTS.md` 第 3 节）。红灯任务在你确认方案前不会派给 L2。

## 目录
```text
AGENTS.md / CLAUDE.md     总规则（唯一权威出处）
roles/                    5 个角色（只写“做什么”，规则引用 AGENTS.md）
docs/PRD.md               产品需求
docs/MODELS.md            L1/L2/L3 → 本机 OpenCode 模型映射
docs/STACK.md             技术栈与决策记录
docs/rules/               通用编码规范只读快照（PRINCIPLES / WORKFLOW / RESEARCH / HANDOVER）
tasks/board.md            任务总表（仅 GM 维护）
tasks/000-template.md     任务卡模板
contracts/openapi.yaml    接口契约
db/migrations/            数据库迁移
Makefile / scripts/run.ps1   统一命令入口（两份实现，必须同步）
scripts/sync-rules.ps1    从规范库同步 docs/rules/ 快照
.env.example              多 Worktree 环境变量示例
```
