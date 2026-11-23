# T-XXX 任务标题

- **负责角色**：`architect` | `backend` | `frontend` | `qa`
- **模型档位**：`L1 (tier-1-reasoning)` | `L2 (tier-2-coding)` | `L3 (tier-3-fast)`
- **指定模型**：填 `docs/MODELS.md` 中该档位的 `provider/model`（可直接用于 OpenCode 的 `/models` 或 `opencode -m`）
- **前置依赖**（必须已合并入 `main`）：`无` 或 `T-001, T-002`
- **建议分支名**：`<角色>/T-XXX-<简述>`
- **当前状态**：`todo` | `doing` | `blocked` | `review` | `done`

---

## 1. 子 Agent 启动指令（由 GM 生成，直接复制到 Orca Worktree 终端）
> 你是本项目的 **<角色>**（当前运行在指定模型档位 **<L1/L2/L3>**）。请依次阅读 `AGENTS.md`、`roles/<角色>.md` 和本任务卡 `tasks/T-XXX.md`。严格在允许修改的目录内完成任务；若 `check` 连续失败 ≥ 2 次或发现契约问题，立即在本文件底部标记 `BLOCKED (需 GM 判断)` 并写明失败原因后停止，不要自行升级或重试。

## 2. 任务背景与输入
- 关联契约：`contracts/openapi.yaml` 中的 `<路径>`
- 关联数据表 / 实体：（如涉及 DB 迁移，由架构师在此写明表名、字段、类型与索引要求）

## 3. 验收标准（DoD — 必须具体、可测试）
- [ ] 标准 1（例如：`POST /auth/register` 成功返回 `201`，重复邮箱返回 `409` 及统一 `Error` 结构）
- [ ] 标准 2（例如：`POST /auth/login` 成功返回 `200` + JWT，错误密码返回 `401`）
- [ ] 标准 3（例如：`make check` 或 `./scripts/run.ps1 check` 全部通过，无新增 lint/type 错误）

---

## 4. 执行进展与阻塞记录（由执行 Agent 追加）
- `YYYY-MM-DD`: 进展 / 遇到的阻塞 / 下一步计划

## 5. QA 审查结论（由 QA 或 GM 追加）
- 结论：`待审查` | `QA: PASS` | `QA: FAIL — 原因与定位`
