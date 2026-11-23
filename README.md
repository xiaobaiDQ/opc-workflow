# OPC 多 Agent 工作流模板（Orca + 模型分级调度版）

一人公司（OPC）+ 一支按需调度的 AI 团队：**总经理（GM）、架构（Architect）、后端（Backend 含 DB）、前端（Frontend）、审查（QA）** 五个角色。
核心策略：**强模型（L1）想清楚定契约，高性价比模型（L2/L3）按契约并行写业务代码，失败超 2 次自动熔断升级**。

## 1. 模型分级调度策略（由 GM 统一派单）

| 档位 | 角色 / 任务类型 | 目的 |
|---|---|---|
| **L1 深度推理级** | **GM**（拆任务/验收）、**Architect**（定技术栈/写 OpenAPI 契约/搭脚手架）、**QA**（核心安全/复杂逻辑审查）、疑难 Bug 攻坚 | 把边界、接口契约和验收标准钉死，不让下游猜 |
| **L2 业务编码级** | **Backend**（按契约写接口 + SQL 迁移 + 单测）、**Frontend**（按契约写页面组件 + 交互测试） | 契约已定的具象业务代码，高性价比快速产出 |
| **L3 极速轻量级**（有条件时与 L2 不同；允许复用） | 文案/样式微调、Mock 数据填充、简单格式修复 | 机械性小改动，极速低成本 |

> **具体用哪个模型不写死**：GM 开工前运行 `opencode models` 查看本机可用模型，按 [`docs/MODELS.md`](docs/MODELS.md) 的选型标准填好 L1/L2/L3 映射，之后所有任务卡都引用这份映射。

> **熔断机制**：L2/L3 模型在同一任务上 `check` 连续失败 ≥ 2 次时，严禁删测试或死循环，必须在 `tasks/T-XXX.md` 标记 `BLOCKED (请求升级 L1 模型)`，由 GM 换 L1 强模型接手。

## 2. 在 Orca 中的标准运转节奏

> **核心原则**：Orca 的 Worktree **按任务临时创建、合入 `main` 后即销毁**（不要按角色长期养旧分支）；并行子 Agent **只改自己的 `tasks/T-XXX.md`**，不碰 `tasks/board.md`，彻底杜绝 Git 合并冲突。

0. **阶段零：初始化模型映射（GM，一次性）**：运行 `opencode models`，按 `docs/MODELS.md` 填好三档映射。
1. **阶段一：规划与拆单（主分支 / GM — 使用 L1 模型）**
   - 对话开场词：
     > 你是本项目的 **gm**。请先阅读 `AGENTS.md` 和 `roles/gm.md`，和我一起确认 `docs/PRD.md`，然后拆解任务写入 `tasks/board.md` 与 `tasks/T-XXX.md`，并为每个任务指定 L1/L2/L3 模型与启动指令。
2. **阶段二：底座与契约先行（Architect — 使用 L1 模型，小项目可由 GM 兼任）**
   - 完成工程脚手架（`T-001`）与接口契约 `contracts/openapi.yaml`（`T-002`）。
   - **关键一步**：底座和契约任务验收后，**必须先合并进 `main`**（否则后续并行的 Worktree 看不到契约）。
3. **阶段三：多 Worktree 并行编码（Backend / Frontend — 使用 L2 模型）**
   - 在 Orca 中从最新 `main` 为每个独立任务新建 Worktree（如 `backend/T-003-auth-api`、`frontend/T-004-auth-ui`）。
   - 新 Worktree 初始化：运行 `make worktree-init`（Windows PowerShell 运行 `./scripts/run.ps1 worktree-init`）。
   - 直接复制 `tasks/T-XXX.md` 第 1 节由 GM 生成好的**子 Agent 启动指令**到对应模型终端开跑。
   - 前端可直接配合 Orca 内置浏览器的 **Design Mode** 点选组件快速微调。
4. **阶段四：审查、合并与销毁（QA & GM）**
   - 子 Agent 跑通 `make check`（或 `./scripts/run.ps1 check`）并在 `tasks/T-XXX.md` 标记 `review`。
   - 核心任务由 QA（L1/L2）按清单审查并写下 `QA: PASS/FAIL`；GM 在 Orca Diff 视图确认后合并回 `main`，更新 `tasks/board.md` 并销毁该任务 Worktree。

## 3. 目录结构
```text
AGENTS.md / CLAUDE.md     总规则与模型分级调度宪法
roles/                    5 个角色指令（gm / architect / backend / frontend / qa）
docs/PRD.md               产品需求文档
docs/MODELS.md            L1/L2/L3 档位 → 本机 OpenCode 模型映射（GM 查询后填写）
docs/STACK.md             技术栈与轻量架构决策记录（ADR）
tasks/board.md            任务总表与模型分配（仅 GM 在主分支维护）
tasks/000-template.md     单任务卡模板（复制为 tasks/T-XXX.md，各 Worktree 独立写进展防冲突）
contracts/openapi.yaml    OpenAPI 3 接口契约
db/migrations/            数据库迁移文件（由 backend 角色统一维护）
Makefile                  Unix / Git Bash / WSL 统一命令入口
scripts/run.ps1           Windows PowerShell 原生命令入口
.env.example              Orca 多 Worktree 环境变量与端口隔离示例
```
