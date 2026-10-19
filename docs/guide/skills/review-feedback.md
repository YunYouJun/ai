# 处理 Review 意见

`review-feedback` 拉取当前 PR 上 Copilot 或人工 Reviewer 的意见，按严重程度分类后修复、推送，并说明哪些意见被跳过及原因。

| 调用                                     | 触发   | 来源                                                                                                 |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `/ai-coding:review-feedback [pr-number]` | 仅手动 | [ai-coding 插件](https://github.com/YunYouJun/ai/tree/main/plugins/ai-coding/skills/review-feedback) |

## 适用场景

- PR 收到一批 Review 意见，希望统一处理并逐条回复；
- 同时处理 Copilot 和人工 Reviewer 的意见。

## 安装

```bash
# 作为插件安装（包含 Issue → PR 与代码审查全部 Skills）
claude plugin install ai-coding@yunyoujun

# 或单独安装
npx skills add YunYouJun/ai --skill=review-feedback
```

## 使用示例

```text
# 自动识别当前分支的 PR
/ai-coding:review-feedback

# 指定 PR
/ai-coding:review-feedback 128
```

## 流程

1. 取 PR 编号：使用参数，或从当前分支识别；
2. 拉取 Review、评论和行内评论；
3. 分为必须修复、建议修复和可选三类；
4. 修复前两类，然后运行 lint 和类型检查；
5. 以 `fix: address review feedback` 提交并推送；
6. 在 PR 上回复已处理的意见，汇报修改内容和跳过原因。

::: warning 注意
这个 Skill 会直接推送并在 PR 上发表评论，请在确认可以发布的分支上使用。只处理 Copilot 意见、需要更严格的授权边界时，改用 [`address-copilot-review`](./address-copilot-review)。
:::

## 完整指令

::: details SKILL.md

<<< @/../plugins/ai-coding/skills/review-feedback/SKILL.md

:::
