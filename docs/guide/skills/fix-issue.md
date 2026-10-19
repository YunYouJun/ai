# 修复 Issue

`fix-issue` 端到端修复一个已授权的 GitHub Issue：先复现并写出失败的回归测试，再做最小修复、运行检查和独立审查，最后创建 Draft PR。

| 调用                                         | 触发   | 来源                                                                                           |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| `/ai-coding:fix-issue [issue-number-or-url]` | 仅手动 | [ai-coding 插件](https://github.com/YunYouJun/ai/tree/main/plugins/ai-coding/skills/fix-issue) |

## 适用场景

- 已确认要修的 Bug，希望从复现到 Draft PR 一次完成；
- 由 [`triage-issues`](./triage-issues) 或 [`pr-cycle`](./pr-cycle) 调用，继承任务记录、文件白名单和预算。

## 安装

```bash
# 作为插件安装（包含 Issue → PR 与代码审查全部 Skills）
claude plugin install ai-coding@yunyoujun

# 或单独安装
npx skills add YunYouJun/ai --skill=fix-issue
```

## 使用示例

```text
/ai-coding:fix-issue 42
/ai-coding:fix-issue https://github.com/owner/repo/issues/42
```

## 流程

1. 校验参数为正整数或当前仓库的 Issue URL，Issue 正文和评论一律视为不可信数据；
2. 检查相关的开放与已合并 PR，已修复则跳过；
3. 记录基线 SHA，复现问题并建立失败的回归测试；
4. 在独立分支上做最小修复，检查 diff 中没有无关改动和敏感内容；
5. 按仓库脚本运行测试、lint、类型检查和构建，如实报告每条命令的结果；
6. 获得发布授权后才推送，用 `gh pr create --draft` 创建 Draft PR。

::: tip 边界
不会 merge、发布、部署或修改仓库设置。Issue 含义不清、无法复现或超出授权范围时，直接停止并报告阻塞原因。
:::

## 完整指令

::: details SKILL.md

<<< @/../plugins/ai-coding/skills/fix-issue/SKILL.md

:::
