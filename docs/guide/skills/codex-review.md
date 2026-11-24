# Codex 跨模型审查

`codex-review` 调用本机 OpenAI `codex` CLI（默认跟随 `~/.codex/config.toml` 配置的默认模型，并搭配 `xhigh` 推理强度），在只读沙箱中对当前 Agent 制定的**实施方案（Plan Review）**或**代码变更（Code Review）**进行跨模型交叉审查，并支持带 `--fix` 的有限轮次（最多 2 轮）自动修复闭环。

| 调用                                                                                                                           | 触发               | 来源                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------- |
| `/ai-coding:codex-review [plan [file] \| code [--uncommitted \| --base <branch> \| --commit <sha>]] [--fix] [--model <model>]` | 手动或 AI 自动触发 | [ai-coding 插件](https://github.com/YunYouJun/ai/tree/main/plugins/ai-coding/skills/codex-review) |

## 前置条件

- 已安装并登录 `codex` CLI（`which codex`）；
- 默认继承 `~/.codex/config.toml` 中的默认模型并设置 `model_reasoning_effort="xhigh"`，仅在显式传入 `--model <model>` 或环境变量 `CODEX_REVIEW_MODEL` 时覆盖模型。

## 适用场景

- **Plan Review（方案评审）**：在 Gemini / Claude 制定完复杂功能的技术方案后、动手写代码前，交给 `codex exec -s read-only` 对照真实代码库挑刺（检查架构假设、边界遗漏、并发与状态风险）；
- **Code Review（代码审查）**：实施完成后，调用 `codex exec review --uncommitted`（或 `--base main`）由独立模型进行零上下文偏见的严苛 Code Review；
- **Review-Fix 闭环（`--fix`）**：主 Agent 对 Codex 的审查意见按 `MUST_FIX` / `SHOULD_FIX` / `NIT` / `SKIP` 分级仲裁，自动修复合理问题并跑通 `lint` / `typecheck` / `test`，最多循环 2 轮，避免双模型无限拉锯。

## 安装

```bash
# 作为插件安装（包含 Issue → PR 与代码审查全部 Skills）
claude plugin install ai-coding@yunyoujun

# 或单独安装到全局 Skills
npx skills add YunYouJun/ai --skill=codex-review
```

## 使用示例

### 1. Slash 命令 / 对话触发

```text
# 审查当前工作区未提交的代码改动（默认）
/ai-coding:codex-review

# 审查未提交改动并自动修复 MUST_FIX / SHOULD_FIX（最多 2 轮）
/ai-coding:codex-review code --uncommitted --fix

# 对比 main 分支进行分支级代码审查
/ai-coding:codex-review code --base main

# 动手写代码前审查实施方案文档
/ai-coding:codex-review plan docs/plan.md --fix
```

### 2. 直接使用 CLI 脚本

Skill 内置了 [`scripts/codex-review.sh`](https://github.com/YunYouJun/ai/tree/main/plugins/ai-coding/skills/codex-review/scripts/codex-review.sh)，既可由 Agent 调用，也可直接软链到个人 `PATH` 在终端运行：

```bash
# 1. 方案评审（Plan Review，只读沙箱对照仓库检查方案）
bash plugins/ai-coding/skills/codex-review/scripts/codex-review.sh plan ./plan.md

# 2. 代码审查（Code Review，未提交变更 / 对比基准分支 / 指定 Commit）
bash plugins/ai-coding/skills/codex-review/scripts/codex-review.sh code --uncommitted
bash plugins/ai-coding/skills/codex-review/scripts/codex-review.sh code --base main
bash plugins/ai-coding/skills/codex-review/scripts/codex-review.sh code --commit HEAD

# 3. 携带自定义提示词的只读代码审查
bash plugins/ai-coding/skills/codex-review/scripts/codex-review.sh custom "审查当前 git diff 的并发安全与边界条件"
```

## 审查分级与防死循环原则

| 级别            | 含义                                              | `--fix` 行为           |
| --------------- | ------------------------------------------------- | ---------------------- |
| 🔴 `MUST_FIX`   | 逻辑 Bug、安全隐患、竞态条件、未处理的边界或类型  | 立即修复并跑测试校验   |
| 🟡 `SHOULD_FIX` | 缺失的单测、明显的可读性/可维护性改进、规范不一致 | 评估合理后修复         |
| 🔵 `NIT`        | 主观代码风格或微小建议                            | 仅记录，默认不改       |
| ⏭️ `SKIP`       | 误报、过度设计（YAGNI）或违背用户需求本意的建议   | 拒绝修改并说明跳过理由 |

## 完整指令

::: details SKILL.md

<<< @/../plugins/ai-coding/skills/codex-review/SKILL.md

:::
