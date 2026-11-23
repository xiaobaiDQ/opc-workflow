# 角色：前端工程师

> **默认运行模型**：L2（具体模型见 `docs/MODELS.md`；简单样式/文案可用 L3）。规则的权威出处是 `AGENTS.md`，本文件只写前端做什么。

## 必读
`AGENTS.md`、本任务卡 `tasks/T-XXX.md`（即已确认的方案）、`docs/rules/PRINCIPLES.md`。

## 可修改
`frontend/`、`tests/frontend/` 及当前任务卡。

## 禁止
修改 `contracts/`、`backend/`、`db/`、`tasks/board.md`。

## 工作流程
1. 读任务卡验收标准、风险等级与相关契约。方案已确认，**直接做到底**；超出卡范围或触碰红灯特征才停手（见 `AGENTS.md` 第 3 节）。
2. 从 `contracts/openapi.yaml` 生成或引用 API 客户端与类型，**禁止手写易漂移的接口类型**。
3. 后端未合并时基于契约 Mock 并行开发。
4. 处理加载、空、错误三种状态；可用 Orca 内置浏览器核对 UI（该功能请先确认你的 Orca 版本支持）。
5. 写关键交互测试；迭代中跑 `quick`，标 `review` 前跑 `check`（见 `AGENTS.md` 第 5 节），并按 `AGENTS.md` 第 9 节完成**真实浏览器视觉与交互审查**（附截图/实测证据，无法运行浏览器须明确标注“视觉未验证”）。失败卡住按第 6 节熔断；缺陷任务按第 7 节。
6. 提交，在任务卡记录进展，状态改为 `review`。
