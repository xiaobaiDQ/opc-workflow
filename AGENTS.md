# AGENTS.md — 所有 Agent 共用的总规则

> 本文件是项目的唯一“宪法”。任何工具（Orca / Claude Code / Codex / Cursor / Antigravity）里的 Agent 开工前必须先读完它，再读自己的 `roles/<角色>.md` 与对应的任务卡 `tasks/T-XXX.md`。

## 1. 项目真相来源（Source of Truth）
| 内容 | 文件 | 维护者 |
|---|---|---|
| 产品需求 | `docs/PRD.md` | GM |
| 任务总表与模型调度 | `tasks/board.md` | **仅 GM 可改**（防多分支冲突） |
| 单任务详情、进展与审查 | `tasks/T-XXX.md` | GM 创建，执行角色与 QA 追加记录 |
| 模型档位 → 本机模型映射 | `docs/MODELS.md` | GM（用 `opencode models` 查询后填写） |
| 技术栈与架构决策（ADR） | `docs/STACK.md` | 架构（小项目可由 GM 兼任） |
| 接口契约 | `contracts/openapi.yaml` | 架构 |
| 数据库迁移 | `db/migrations/*.sql` | 后端（含 DB 职责） |

冲突时以上表文件为准，**不以聊天记录为准**。

## 2. 模型分级调度策略（Model Routing）
本项目运行在 **OpenCode**（Orca 中）。由 **GM** 在拆解任务时，根据任务复杂度为每个子任务指定**模型档位**（写入 `tasks/board.md` 及 `tasks/T-XXX.md`）。

**具体模型名不写在规则里**：档位 → 本机实际模型的映射统一维护在 [`docs/MODELS.md`](docs/MODELS.md)，由 GM 运行 `opencode models` 查看可用模型后填写。**严禁凭记忆编造模型名。**

| 档位 | 适用场景 / 角色 | 调度原则 |
|---|---|---|
| **L1 深度推理级**<br>(`tier-1-reasoning`) | • **GM**：需求澄清、拆任务、冲突裁决<br>• **Architect**：系统设计、契约定义、脚手架初始化<br>• **QA / 攻坚**：核心安全/逻辑审查、复杂疑难 Bug | 本机最强推理模型；“想清楚、定边界、审核心”，宁慢勿错 |
| **L2 业务编码级**<br>(`tier-2-coding`) | • **Backend**：契约已定的接口实现、SQL 迁移、单元测试<br>• **Frontend**：页面组件、状态对接、常规交互测试 | 编码强、性价比高的中档模型；契约与验收标准明确后快速批量落地 |
| **L3 极速轻量级**<br>(`tier-3-fast`) | • 样式/文案微调、Mock 数据填充、格式修复、简单重构 | 最便宜最快的小模型（**必须与 L2 不同**）；仅限明确的单文件或机械性改动 |

> 开工前检查：若 `docs/MODELS.md` 状态仍为“未初始化”，GM 必须先完成其中的初始化流程。

### 自动升级与熔断规则（防低价模型死循环）
1. **连续失败熔断**：L2/L3 模型在单个任务上运行 `check` **连续失败 ≥ 2 次**，或发现需要修改契约/跨模块架构时，**严禁原地死磕或删改测试**。
2. **上报升级**：立即在 `tasks/T-XXX.md` 写入 `状态: BLOCKED (请求升级 L1 模型)` 及失败原因并停止，由 GM 换用 L1 模型（或在 Orca 中用 Fan-Out 派发给 L1 档的不同模型）接手。

## 3. Orca Worktree 与 Git 协作铁律
1. **按任务开 Worktree，不按角色常驻 Worktree**：
   - 每个任务从最新 `main` 拉出独立 Worktree，分支命名：`<角色>/T-XXX-<简述>`（如 `backend/T-004-login-api`）。
   - 任务验收合并进 `main` 后，立即销毁该 Worktree。
2. **底座先合 `main`，业务再并发**：
   - 脚手架初始化、接口契约（`contracts/`）、共享基础配置**必须先合并到 `main`**，随后才能从 `main` 并发拉出后端、前端子任务 Worktree（否则其他 Worktree 看不到未合并的契约）。
3. **单任务单文件（零合并冲突）**：
   - 子 Agent **严禁修改 `tasks/board.md`**。
   - 所有进展、阻塞提问、自测结果、QA 结论统一追加到该任务自己的 `tasks/T-XXX.md` 中。
4. **新 Worktree 环境隔离**：
   - GM 必须先把任务卡提交进 `main` 再开 Worktree。新建 Worktree 后先运行 `worktree-init`（脚手架完成前只拷贝 `.env`）。
   - `Makefile` 与 `scripts/run.ps1` 是同一套命令的两份实现，改命令必须两边同步。
   - 新建 Worktree 后先跑初始化命令自动准备 `.env` 与依赖；多 Worktree 并行启动本地服务时通过 `.env` 中的端口变量错开端口，避免容器与端口冲突。

## 4. 统一命令入口
在 Unix / Git Bash / WSL 下统一使用 `make`，在 Windows PowerShell 下可直接运行 `./scripts/run.ps1 <command>`（两者等价）：
```
make worktree-init  # 新建 Worktree 后初始化（拷贝 .env + 安装依赖）
make setup          # 安装依赖
make dev            # 启动本地开发环境
make test           # 运行测试
make lint           # 格式 + 静态检查 + 类型检查
make contract-check # 校验 OpenAPI 契约合法性
make check          # = lint + test + contract-check（提交前必须通过）
make db-migrate     # 执行数据库迁移
```

## 5. 工作纪律与完成定义（DoD）
1. **一次只做一个任务**：必须在 `tasks/T-XXX.md` 中有明确定义和验收标准。
2. **严守目录边界**：只改自己角色允许的目录（见 `roles/*.md`）以及当前任务卡 `tasks/T-XXX.md`。需要跨界修改 → 在 `tasks/T-XXX.md` 标记阻塞交给 GM 协调。
3. **契约先行**：接口变化先走 `contracts/openapi.yaml`，表结构变化走 `db/migrations/`。
4. **提交格式**：`[T-XXX] <角色>: <简述>`。
5. **完成定义（DoD）**：`check` 全部通过（严禁空跑假通过）+ 逐条满足 `tasks/T-XXX.md` 验收标准 + 在 `tasks/T-XXX.md` 更新状态为 `review`。
6. **红线**：禁止提交密钥 / `.env`；禁止删除或弱化已有测试来“让测试通过”；不确定时停下来在 `tasks/T-XXX.md` 写清问题，不要猜。
