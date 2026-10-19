# 提交前审查

`review-staged` 在提交前审查暂存区（`git diff --cached`）的变更，把 Code Review 提前到 commit 之前。它是 `ai-coding` 插件中唯一允许 AI 按上下文自动触发的 Skill。

| 调用                               | 触发               | 来源                                                                                               |
| ---------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| `/ai-coding:review-staged [--fix]` | 手动或 AI 自动触发 | [ai-coding 插件](https://github.com/YunYouJun/ai/tree/main/plugins/ai-coding/skills/review-staged) |

## 适用场景

- 提交前快速检查逻辑错误、安全问题、类型和风格；
- 改了逻辑却没更新测试时给出提醒；
- 加 `--fix` 自动修复 MUST_FIX 与 SHOULD_FIX，并重新暂存修改过的文件。

## 安装

```bash
# 作为插件安装（包含 Issue → PR 与代码审查全部 Skills）
claude plugin install ai-coding@yunyoujun

# 或单独安装
npx skills add YunYouJun/ai --skill=review-staged
```

## 使用示例

```text
/ai-coding:review-staged
/ai-coding:review-staged --fix
```

## 审查分级

| 级别            | 含义                           |
| --------------- | ------------------------------ |
| 🔴 `MUST_FIX`   | Bug、安全问题、数据丢失风险    |
| 🟡 `SHOULD_FIX` | 风格、类型、可读性、缺失的测试 |
| 🔵 `NIT`        | 可选的小建议                   |
| ✅ `GOOD`       | 值得肯定的写法                 |

只审查暂存的改动；已有问题只有在本次改动让它变得更糟时才会指出。最后给出结论：可以提交、有待处理的问题，或存在必须先修复的严重问题。

## 完整指令

::: details SKILL.md

<<< @/../plugins/ai-coding/skills/review-staged/SKILL.md

:::
