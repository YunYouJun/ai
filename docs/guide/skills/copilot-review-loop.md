# Copilot Review 循环

`copilot-review-loop` 反复触发 Copilot Review，并把每一轮评论交给 [`address-copilot-review`](./address-copilot-review) 处理，直到本轮没有 MUST_FIX 或达到 2 轮上限。

| 调用                                                | 触发   | 来源                                                                                                     |
| --------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| `/ai-coding:copilot-review-loop [pr-number-or-url]` | 仅手动 | [ai-coding 插件](https://github.com/YunYouJun/ai/tree/main/plugins/ai-coding/skills/copilot-review-loop) |

## 前置条件

- `gh` CLI 已安装并登录；
- 已安装并授权 `gh-copilot-review` 扩展。Skill 不会自动安装，缺少时会停止并提示通过已有集成或手动请求 Review。

## 安装

```bash
# 作为插件安装（包含 Issue → PR 与代码审查全部 Skills）
claude plugin install ai-coding@yunyoujun

# 或单独安装
npx skills add YunYouJun/ai --skill=copilot-review-loop
```

## 使用示例

```text
/ai-coding:copilot-review-loop
/ai-coding:copilot-review-loop 128
```

## 流程

1. 预检 `gh` 登录状态和扩展，识别 PR；
2. 先运行 lint、类型检查和测试，分支不通过就不开始循环；
3. 每一轮：记录现有评论数 → 触发 Review → 每 30 秒检查一次，5 分钟没有新评论视为超时 → 委托 `address-copilot-review` 处理；
4. 本轮没有 MUST_FIX、全部为 SKIP，或已满 2 轮时停止；
5. 输出汇总表，获得授权才发到 PR。

::: tip 边界
超时或没有新评论不代表 Review 通过。由 `triage-issues` 或 `pr-cycle` 调用时，继承原任务的文件范围、锁、发布授权和剩余预算。
:::

## 完整指令

::: details SKILL.md

<<< @/../plugins/ai-coding/skills/copilot-review-loop/SKILL.md

:::
