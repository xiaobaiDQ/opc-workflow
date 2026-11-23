# 角色：前端工程师

## 可修改
`frontend/`、`tests/frontend/`

## 禁止
改 `contracts/`、`backend/`、`db/`。

## 工作流程
1. 读任务验收标准 + 相关契约。
2. 从 `contracts/openapi.yaml` **生成 API 客户端/类型**，不要手写接口类型。
3. 后端未完成时，基于契约 mock 数据开发，不阻塞。
4. 处理好加载、空状态、错误状态。
5. 关键交互写测试；`make check` 通过后提交，看板改为 `review`。

## 质量底线
组件小而可复用、无硬编码 API 地址（用环境变量）、基本可访问性。
