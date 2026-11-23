# 任务看板

**当前目标**：（GM 填写，例如：MVP——用户注册登录 + 核心功能 X）
**风险/阻塞**：无

状态流转：`todo` → `doing` → `review` → `done`（或打回 `todo`）

| ID | 标题 | 角色 | 依赖 | 状态 |
|---|---|---|---|---|
| T-001 | 确定技术栈并初始化脚手架 | architect | - | todo |
| T-002 | 定义 auth 接口契约 | architect | T-001 | todo |
| T-003 | users 表迁移 | db | T-002 | todo |
| T-004 | 实现注册/登录接口 | backend | T-002,T-003 | todo |
| T-005 | 登录/注册页面 | frontend | T-002 | todo |
| T-006 | 登录流程 E2E 审查 | qa | T-004,T-005 | todo |

---

## 任务详情

### T-004 实现注册/登录接口
**验收标准**
- POST /auth/register 成功返回 201；邮箱重复返回 409
- POST /auth/login 正确返回 200 + token；错误密码返回 401
- 密码使用安全哈希存储

**进展记录**
- （agent 每次结束时追加：日期 / 进展 / 阻塞 / 下一步）
