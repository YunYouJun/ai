# Issue 分诊

`triage-issues` 只读筛选已授权仓库的开放 Issue，输出低风险候选或跳过原因。全部门禁通过后，才交给 [`fix-issue`](./fix-issue) 复现、修复并创建 Draft PR。

| 调用                                                          | 触发   | 来源                                                                                               |
| ------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `/ai-coding:triage-issues [repository] [issue-number-or-url]` | 仅手动 | [ai-coding 插件](https://github.com/YunYouJun/ai/tree/main/plugins/ai-coding/skills/triage-issues) |

::: warning 单仓试运行
Skill 正文和策略示例目前都精确限定 `YunYouJun/valaxy`，其他仓库需要先修改 Skill 与策略再使用。策略只是约定，没有实现 webhook 接收器、调度器、锁服务或运行时沙箱，不能当成执行授权。
:::

## 适用场景

- 盘点授权仓库的开放 Issue，最多挑出一个可复现、低风险、维护者批准的问题；
- 对指定 Issue 做只读评估，输出 `eligible` / `skip` / `needs-information` 及证据；
- 为试运行留下可追溯的任务记录：版本、授权、锁、预算和验证证据。

## 安装

```bash
# 作为插件安装（包含 Issue → PR 与代码审查全部 Skills）
claude plugin install ai-coding@yunyoujun

# 或单独安装
npx skills add YunYouJun/ai --skill=triage-issues
```

## 使用示例

```text
/ai-coding:triage-issues YunYouJun/valaxy
/ai-coding:triage-issues YunYouJun/valaxy 123
```

## 门禁流程

1. **Dry-run**：核验仓库、默认分支与 SHA，读取开放 Issue、评论和相关 PR；
2. **选择**：按可复现性、影响范围和风险筛选，没有候选就输出 `no_eligible_issue`；
3. **去重与锁**：按 Issue 版本去重，修改前必须持有仓库锁和 Issue 锁；
4. **复现**：固定基线 SHA 并记录失败用例，无法复现就报告而不是盲修；
5. **最小修复**：带任务记录调用 `fix-issue`，最多 5 个文件、200 行增删；
6. **验证与 Review**：回归用例先失败后通过，最多 2 轮 Review、总耗时 45 分钟；
7. **Draft PR**：门禁通过且获得发布授权后才创建，不自动 merge、release 或 deploy。

任务终态为 `no_eligible_issue`、`already_fixed`、`blocked`、`failed` 或 `draft_pr_created`。完整操作步骤见 [Issue 单仓试运行](/claude-code/issue-autopilot)。

## 完整指令

::: details SKILL.md

<<< @/../plugins/ai-coding/skills/triage-issues/SKILL.md

:::
