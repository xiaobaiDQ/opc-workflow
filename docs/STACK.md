# 技术栈

> 选择标准：主流、生态大、AI 编码最熟练、部署简单。流程本身与技术栈无关，换栈只需改本文件和 Makefile。

## 默认推荐（通用型）
| 层 | 选择 | 理由 |
|---|---|---|
| 语言 | TypeScript（前后端统一） | 一种语言覆盖全栈，AI 生成质量最高之一 |
| 前端 | React + Vite（需要 SEO 时换 Next.js） | 最主流 |
| 后端 | Node.js + Fastify 或 NestJS | 稳定、文档丰富 |
| 数据库 | PostgreSQL | 通用、可靠、云厂商都支持 |
| 迁移 | 纯 SQL 文件（如 dbmate） | 与语言无关 |
| 接口 | OpenAPI 3 + 代码生成 | 前后端共享契约 |
| 运行 | Docker Compose | 本地与线上一致 |
| CI | GitHub Actions 运行 `make check` | 确定性质量关卡 |

## 可替换方案
- 后端换 Python：FastAPI（契约与 SQL 不变）
- 后端换 Go：Gin / Echo
- 数据库轻量化：SQLite（早期原型）
