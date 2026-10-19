# PR 全流程

`pr-cycle` 是从 Issue 出发的编排入口：委托 [`fix-issue`](./fix-issue) 完成修复和 Draft PR，再在授权范围内处理 Review 意见。任务已有关联的 Draft PR 时，不会重复修复或新建分支。

| 调用                                        | 触发   | 来源                                                                                          |
| ------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `/ai-coding:pr-cycle [issue-number-or-url]` | 仅手动 | [ai-coding 插件](https://github.com/YunYouJun/ai/tree/main/plugins/ai-coding/skills/pr-cycle) |

## 适用场景

- 希望一条命令走完 Issue → 修复 → Draft PR → 处理 Review；
- 与 `fix-issue` 的区别：`pr-cycle` 在 PR 创建后继续处理 Review，并可接入 [`copilot-review-loop`](./copilot-review-loop)。

## 安装

```bash
# 作为插件安装（包含 Issue → PR 与代码审查全部 Skills）
claude plugin install ai-coding@yunyoujun

# 或单独安装
npx skills add YunYouJun/ai --skill=pr-cycle
```

## 使用示例

```text
/ai-coding:pr-cycle 42
```

## 流程

1. 解析 Issue，检查任务记录和相关 PR，没有阻塞时委托 `fix-issue`；
2. Draft PR 创建后读取 Review 与行内评论，逐条对照代码确认；
3. 只做授权范围内的修改，重新运行受影响的检查；
4. 需要时调用 `copilot-review-loop`，最多 2 轮；
5. 回复评论需要单独授权，否则只在本地报告中给出回复草稿；
6. 报告 PR URL、head SHA、检查与 Review 结果，PR 保持 Draft。

::: tip 边界
没有评论或 Review 超时不等于通过。不会自动 merge、发布或部署，也不会安装扩展或开启仓库的自动 Review 设置。
:::

## 完整指令

::: details SKILL.md

<<< @/../plugins/ai-coding/skills/pr-cycle/SKILL.md

:::
