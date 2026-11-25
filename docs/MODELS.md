# 模型档位映射（MODELS.md）

> 本文件把抽象档位（L1/L2/L3）映射到**当前所选执行器（Claude Code / Codex / Antigravity / OpenCode / Orca Bot 等）实际可用**的模型。
> 其他文件（AGENTS.md、roles/、任务卡）只写档位，不写具体模型名，换订阅或模型更新时只改本文件。
> 维护者：GM（L1）。状态：**未初始化**（首次使用先执行下面的“初始化流程”）。

## 初始化流程（GM 执行，项目开始前或更换订阅/执行器后重做）
1. 按当前使用的执行器查询真实可用模型：**严禁凭记忆编造模型名**。
   - 若使用 **OpenCode**：在终端运行 `opencode models`（可加 provider 过滤）获取 `provider/model` 列表；
   - 若使用 **Orca Bot UI / Claude Code / Codex / Antigravity**：记录各执行器或 Orca Bot 实际绑定的可用模型名。
2. 按下面“选型标准”为每个档位挑选 1 个主选 + 最多 1 个备选。
3. 把结果填入下表，状态改为“已初始化 + 日期”。
4. 若某档位找不到合适模型，在表中写明“用 Lx 代替”，并在汇报时顺带告知老板（无需等待回复）。

## 选型标准（按能力特征挑，不按名字）
| 档位 | 用途 | 挑选特征 | 优先级 |
|---|---|---|---|
| **L1 深度推理** `tier-1-reasoning` | GM、Architect、Evolver（旁路复盘/Skill 提炼）、QA 核心审查、熔断后的疑难修复 | 本机最强的旗舰/推理（thinking / reasoning / pro / opus 一类）模型 | 质量 > 成本 |
| **L2 业务编码** `tier-2-coding` | Backend、Frontend 按契约写代码与测试 | 编码能力强、性价比高的中档模型（sonnet / flash / V3 / codex 中档一类） | 性价比 |
| **L3 极速轻量** `tier-3-fast` | 样式文案微调、Mock 数据、格式修复、机械重构 | 最便宜最快的小模型（haiku / flash-lite / mini 一类） | 成本 / 速度 |

**档位可以复用**：本机模型不足时，允许多个档位用同一个模型（优先保证 L1 是最强的），在“备注”写明即可，不必停下来问老板。理想情况下 L2 与 L3 用不同模型以省成本。

**同模型复用时的升级说明**：换个提示词重试、或换到同一个底层模型都**不算升级**。具体熔断触发条件与上报流程统一见 `AGENTS.md` 第 6 节（触发后在任务卡标 `blocked` 交 GM 裁决）。

## 当前映射（由 GM 填写）
| 档位 | 执行器 / 主选模型（OpenCode 填 provider/model） | 备选 | 备注 |
|---|---|---|---|
| L1 | _待填_ | _待填_ | |
| L2 | _待填_ | _待填_ | |
| L3 | _待填_ | _待填_ | |

## 启动方式（OpenCode）
- 查询：终端运行 `opencode models`（`--refresh` 刷新目录，`--verbose` 查看价格等元数据）。
- 切换：OpenCode 界面内输入 `/models`；非交互运行用 `opencode run -m <provider/model> "<提示>"`；固定默认值可在 `opencode.json` 写 `"model": "<provider/model>"`。
- 以上命令依据 OpenCode 2.x 文档；若你本机版本行为不同，以 `opencode --help` 为准并更新本节。
- 任务卡里的“执行器与模型”须填所选执行器实际可用的模型或 Orca Bot 绑定；选用 OpenCode 时直接填本表中的 `provider/model`。
