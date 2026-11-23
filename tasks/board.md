# 任务总表（仅 GM 在主分支维护）

> **防冲突规则**：并行 Worktree 中的子 Agent **严禁修改本文件**。各任务的验收标准、进展记录、阻塞提问与 QA 结论统一写入各自独立的 `tasks/T-XXX.md` 文件（模板见 [tasks/000-template.md](./000-template.md)）。

**当前里程碑**：（由 GM 与老板确认 PRD 后填写）
**当前风险 / 阻塞**：无

状态流转：`todo` → `doing` → `review` → `done`（或 `blocked` / 打回 `todo`）

| ID | 标题 | 角色 | 模型档位（具体模型见 docs/MODELS.md） | 依赖（须先合入 `main`） | 任务卡 | 状态 |
|---|---|---|---|---|---|---|
| *(待拆解)* | | | | | | |

---

## 编排示例（新项目开工时由 GM 替换上表）

> 说明：凡是作为下游依赖的底座任务（如 `T-001`、`T-002`），必须**先合并进 `main`**，再在 Orca 中从最新 `main` 并行开启 `T-003`、`T-004` 的 Worktree。

| ID | 标题 | 角色 | 模型档位（具体模型见 docs/MODELS.md） | 依赖（须先合入 `main`） | 任务卡 | 状态 |
|---|---|---|---|---|---|---|
| T-001 | 确定技术栈并初始化工程脚手架 | architect | `L1` | - | `tasks/T-001.md` | todo |
| T-002 | 定义 auth 接口契约与 users 表结构要求 | architect | `L1` | T-001 | `tasks/T-002.md` | todo |
| T-003 | users 表迁移 + 实现注册/登录接口与单测 | backend | `L2` | T-002 | `tasks/T-003.md` | todo |
| T-004 | 登录/注册页面与契约客户端对接 | frontend | `L2` | T-002 | `tasks/T-004.md` | todo |
| T-005 | 登录流程 E2E 与安全审查 | qa | `L1` | T-003, T-004 | `tasks/T-005.md` | todo |
