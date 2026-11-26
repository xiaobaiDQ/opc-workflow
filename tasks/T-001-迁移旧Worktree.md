# T-001 把 3 个旧 Worktree 迁到 `.worktrees/`

- **负责角色**：`gm`（或架构师协助；本卡仅迁移目录位置，不改业务代码）
- **风险等级**：`黄`（保存或丢弃未提交改动须老板单独确认，见 `AGENTS.md` 第 3 节）
- **模型档位**：`L1`　**执行器与模型**：GM（按 `docs/MODELS.md` 实际配置）
- **类型**：`feature`（一次性规范迁移）
- **前置依赖**（须已合入 `main`）：`无`
- **建议分支名**：`无`（在主仓库根目录执行 Worktree 迁移操作，不改分支代码）
- **当前状态**：`todo`

---

## 1. 执行指令（确认后执行，本卡创建阶段不执行迁移）
> 请按 `AGENTS.md` 第 3、4 节纪律，将 3 个位于仓库上一级目录的旧 Worktree 安全迁移到 `<仓库>/.worktrees/<任务名>`。**发现任何未提交改动或未跟踪文件时，严禁擅自丢弃、覆盖或强行移动，必须先列清单请老板单独确认处置方式（commit / stash / 完整备份）后再执行。**

## 2. 迁移范围与步骤
- **目标旧 Worktree（3 个）**：
  1. `opc-workflow-exploded-view-trial`
  2. `opc-workflow-evolver-handbook`
  3. `opc-workflow-priority-route`
- **执行步骤**：
  1. 逐个只读盘点每棵树的 `git status`（含未跟踪文件）和未推送的提交（`git log --branches --not --remotes` 或对照 `main` 的差异）；
  2. 若存在未提交改动，列出文件与差异摘要呈交老板，由老板单独决定 `commit`、`stash` 还是完整备份；
  3. 使用 `git worktree move <旧路径> .worktrees/<名>` 逐个迁入 `.worktrees/`；
  4. 在主仓库根目录对 3 个 Worktree 逐个运行 `./scripts/run.ps1 worktree-check <名>`（或 `make worktree-check NAME=<名>`）核验。

## 4. 验收标准与实测证据（按 `已通过` / `实测失败` / `未验证` 记录；严禁拿间接指标充数）
- [ ] 3 个迁移后的 Worktree 逐个跑 `worktree-check <名>` 全部 `[PASS]`｜**证据（版本/入口或环境/实际结果）**：`未验证`
- [ ] `git worktree list` 输出中不再存在位于仓库上一级目录的 Worktree｜**证据（版本/入口或环境/实际结果）**：`未验证`
- [ ] 迁移前后 3 棵树的 `git status` 完全一致（无丢失改动或误删文件）｜**证据（版本/入口或环境/实际结果）**：`未验证`

---

## 5. 执行进展、批次检查点与接力交接（由执行 Agent 追加）
- `2026-11-26`: 任务卡已起草，尚未执行迁移，待老板确认后推进。

## 6. QA 审查结论（由 QA 或 GM 追加）
- 结论：`待审查`
