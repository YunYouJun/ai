# 处理 Copilot Review

`address-copilot-review` 单轮处理 PR 上 GitHub Copilot 的 Review 评论：抓取、分类、修复、校验，获得授权时逐条回复。可以单独使用，也是 [`copilot-review-loop`](./copilot-review-loop) 每一轮的处理器。

| 调用                                                   | 触发   | 来源                                                                                                        |
| ------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------- |
| `/ai-coding:address-copilot-review [pr-number-or-url]` | 仅手动 | [ai-coding 插件](https://github.com/YunYouJun/ai/tree/main/plugins/ai-coding/skills/address-copilot-review) |

## 适用场景

- Copilot 已经 Review 完，希望一次处理所有评论；
- 需要明确区分发布授权和回复授权，未授权时只生成本地回复草稿。

## 安装

```bash
# 作为插件安装（包含 Issue → PR 与代码审查全部 Skills）
claude plugin install ai-coding@yunyoujun

# 或单独安装
npx skills add YunYouJun/ai --skill=address-copilot-review
```

## 使用示例

```text
/ai-coding:address-copilot-review
/ai-coding:address-copilot-review 128
```

## 流程

1. 识别 PR（参数或当前分支），校验仓库和 PR 编号；
2. 抓取行内、PR 级和 Issue 式三类 Copilot 评论，没有评论就结束；
3. 分为 `MUST_FIX`、`SHOULD_FIX`、`SKIP` 三类；
4. 先 MUST_FIX 后 SHOULD_FIX，在授权范围内做最小修改；
5. 运行 lint（只检查、不自动修复）、类型检查和测试；
6. 只暂存校验过的文件并提交，获得发布授权后推送；
7. 获得回复授权后逐条回复 Fixed / Skipped / Partially addressed，否则只保留本地草稿；
8. 输出汇总表。

::: tip 工作区
在干净的独立工作树中运行。遇到无关的已暂存或未暂存改动会停止，不会 stash、reset 或暂存其他任务的改动。
:::

## 完整指令

::: details SKILL.md

<<< @/../plugins/ai-coding/skills/address-copilot-review/SKILL.md

:::
