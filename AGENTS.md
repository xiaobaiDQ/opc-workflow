# AGENTS.md — 所有 Agent 共用的总规则

> 本文件是唯一的“宪法”。任何工具（Orca / Claude Code / Codex / Cursor / Antigravity）里的 agent 开工前必须先读完它，再读自己的 `roles/<角色>.md`。

## 1. 项目真相来源（Source of Truth）
| 内容 | 文件 | 维护者 |
|---|---|---|
| 产品需求 | `docs/PRD.md` | GM |
| 任务与进度 | `tasks/board.md` | GM |
| 架构决策 | `docs/decisions/NNNN-*.md` | 架构 |
| 接口契约 | `contracts/openapi.yaml` | 架构 |
| 数据库结构 | `db/migrations/*.sql`（纯 SQL） | DB |
| 技术栈 | `docs/STACK.md` | 架构 |

冲突时以上表文件为准，**不以聊天记录为准**。

## 2. 统一命令入口（与语言无关）
所有 agent 只通过 `make` 调用，不直接记具体框架命令：
```
make setup     # 安装依赖
make dev       # 本地启动全部服务
make test      # 全部测试
make lint      # 格式 + 静态检查 + 类型检查
make check     # = lint + test + contract-check，提交前必须通过
make db-migrate
```
换技术栈只改 `Makefile`，流程不变。

## 3. 工作规则
1. **一次只做一个任务**：任务必须在 `tasks/board.md` 中有 ID（如 `T-012`）。
2. **只改自己角色允许的目录**（见各 `roles/*.md`）。需要改别人的目录 → 在看板上提任务给对应角色。
3. **契约先行**：接口或表结构变化，必须先改 `contracts/` 或 `db/migrations/`，再写实现。
4. **分支命名**：`<角色>/<任务ID>-<简述>`，例如 `backend/T-012-login-api`。
5. **提交信息**：`[T-012] backend: 实现登录接口`。
6. **完成定义（DoD）**：`make check` 通过 + 满足任务验收标准 + 更新看板状态为 `review`。
7. 不确定时**停下来在看板上写问题**，不要猜。
8. 禁止：提交密钥 / `.env`；删除或改写他人测试来“让测试通过”；跳过 `make check`。

## 4. 记忆与交接
- 每次结束工作前，在 `tasks/board.md` 对应任务下追加一行“进展/阻塞/下一步”。
- 重要取舍写成 ADR（`docs/decisions/`），模板见 `docs/decisions/0000-template.md`。
- 新 agent 接手 = 读 `AGENTS.md` → 角色文件 → 看板 → 相关 ADR，即可继续。
