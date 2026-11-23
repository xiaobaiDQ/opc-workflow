# 技术栈与架构决策（STACK & ADR）

> **选择原则**：主流、文档丰富、对 L2 高性价比编码模型（如 `deepseek-v2.5-flash`）最友好、类型约束强（用编译器和契约兜住便宜模型的幻觉）。

## 1. 默认推荐技术栈（全栈 TypeScript）
| 层 | 默认选型 | 理由（针对多模型协作优化） |
|---|---|---|
| 语言 | TypeScript（前后端统一，开启 `strict: true`） | 强类型能让 L2 编码模型的字段拼写/类型错误在 `lint` 阶段直接暴露 |
| 前端 | React + Vite（需 SSR/SEO 时换 Next.js） | AI 训练语料最充足，组件生成准确率高 |
| 后端 | Node.js + Fastify 或 Hono / NestJS | 结构清晰、易与 OpenAPI / Schema 校验结合 |
| 数据库 | PostgreSQL（早期极简原型可用 SQLite） | 通用可靠 |
| 数据库迁移与访问 | `db/migrations/*.sql`（可配合 Drizzle / Prisma / dbmate） | 迁移文件统一落盘到 `db/migrations/`，兼顾可追溯性与类型安全 |
| 接口契约 | `contracts/openapi.yaml` + 自动生成前端类型/客户端 | L1 模型定好契约后，前后端 L2 模型各自照契约写代码，零沟通损耗 |
| 本地运行 | Docker Compose（共享基础 DB + Worktree 环境变量隔离端口） | 避免 Orca 多 Worktree 同时启动时端口与容器冲突 |
| 质量门禁 | `make check` / `./scripts/run.ps1 check` | 确定性关卡（Lint + Typecheck + Test + Contract Check） |

## 2. 可替换方案
- **Python 后端**：FastAPI + Pydantic + Alembic/SQL（导出或校验 `contracts/openapi.yaml`）
- **Go 后端**：Gin / Echo + sqlc + `db/migrations/*.sql`

---

## 3. 架构决策记录（轻量 ADR）
> 无需单独建目录水文档；凡是重要技术选型或破坏性变更，由架构师/GM 在下表追加一条（保持 1~3 句话说清原因与影响）。

| 编号 | 日期 | 状态 | 关联任务 | 决策内容与原因 | 放弃的备选方案 |
|---|---|---|---|---|---|
| ADR-001 | 2026-11-23 | 已采纳 | INIT | 采用“L1 强模型定契约/审核心 + L2 高性价比模型写业务代码 + 2 次失败自动熔断升级”的分级调度策略，兼顾成本与质量 | 全程使用昂贵旗舰模型（成本高）或全程使用小模型（架构易跑偏） |
| ADR-002 | 2026-11-23 | 已采纳 | INIT | 数据库迁移并入 `backend` 角色统一维护，取消独立 `db` 角色；任务状态改为 `tasks/T-XXX.md` 单任务单文件 | 独立 DB Worktree + 所有人共改 `tasks/board.md`（并行冲突极高） |
