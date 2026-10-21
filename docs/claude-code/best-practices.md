# Claude Code 最佳实践

> 参考文章：
>
> - [Claude Code Best Practices - Anthropic Engineering](https://www.anthropic.com/engineering/claude-code-best-practices)
> - [交互模式](https://code.claude.com/docs/zh-CN/interactive-mode)

Claude Code 是一个底层且不带偏见的工具，提供接近原始模型访问的能力，具有高度的灵活性、可定制性和可脚本化特性。本文总结了 Anthropic 工程团队验证的实践模式。

## 1. 定制你的设置

优化环境配置以减少上下文收集的时间和 Token 消耗。

### 创建 `CLAUDE.md` 文件

Claude 会自动将此文件拉入上下文，是记录以下信息的理想场所：

- 常用的 Bash 命令
- 核心文件和工具函数
- 代码风格指南
- 测试说明
- 仓库礼仪（如分支命名、merge vs rebase）
- 开发环境设置
- 项目特有的警告或异常行为
- 其他希望 Claude 记住的信息

**文件放置位置：**

- **仓库根目录**：最常见。推荐提交到 git (`CLAUDE.md`) 或本地忽略 (`CLAUDE.local.md`)
- **父目录**：适用于 Monorepos，多个文件都会被自动拉入
- **子目录**：当在子目录工作时按需拉入
- **用户主文件夹** (`~/.claude/CLAUDE.md`)：应用于所有会话

### 调整 `CLAUDE.md` 文件

不要盲目添加大量内容，应像优化提示词一样迭代改进：

- 使用 `#` 键指令让 Claude 自动将内容写入相关的 `CLAUDE.md`
- 可以使用 "IMPORTANT" 或 "YOU MUST" 等词汇强调指令以提高遵守率

### 管理允许的工具列表

默认情况下，Claude Code 会请求可能修改系统的操作的权限。你可以自定义白名单：

- 在提示时选择 "Always allow"
- 使用 `/permissions` 命令
- 手动编辑 `.claude/settings.json`（推荐提交到代码库）或 `~/.claude.json`
- 使用 `--allowedTools` CLI 标志进行特定会话设置

### 安装 gh CLI

如果你使用 GitHub，安装 `gh` CLI 可以让 Claude 更好地处理 Issues、PR 等交互。

## 2. 给 Claude 更多工具

### 使用 Bash 工具

Claude 继承你的 Bash 环境。对于自定义工具：

1. 告诉 Claude 工具名称和用法示例
2. 让 Claude 运行 `--help` 查看文档
3. 在 `CLAUDE.md` 中记录常用工具

### 使用 MCP (Model Context Protocol)

Claude Code 既可作为 MCP 服务器也可作为客户端。连接方式包括：

- 项目配置
- 全局配置
- 检入代码库的 `.mcp.json` 文件（团队共享）

使用 `--mcp-debug` 标志有助于调试配置问题。

### 使用自定义斜杠命令

在 `.claude/commands` 文件夹中存储 Markdown 模板，通过 `/` 调用。支持 `$ARGUMENTS` 关键字传递参数。例如创建一个 `/project:fix-github-issue` 命令来自动修复 GitHub Issue。需要多步编排时可升级为 Skill，写法见[编写 Skill](/guide/skills/authoring)。

## 3. 尝试常见工作流

### 探索、规划、编码、提交

适用于大多数问题的多功能流程：

1. **读取**：让 Claude 读取相关文件/图片/URL，**明确告知暂时不要写代码**。此时适合使用子代理来验证细节
2. **规划**：使用 "think" 触发扩展思考模式。根据复杂度可用 "think hard" / "think harder" / "ultrathink"。可以将计划保存为文档或 GitHub Issue
3. **实现**：让 Claude 实施解决方案
4. **提交**：让 Claude 提交并创建 PR，更新相关文档

### 写测试、提交；写代码、迭代、提交 (TDD)

Anthropic 内部推崇的工作流：

1. **写测试**：基于输入/输出对，明确告知不要写实现代码（甚至 mock 也不要）
2. **确认失败**：运行测试确认失败
3. **提交测试**
4. **写代码**：让 Claude 编写代码通过测试，禁止修改测试，直到所有通过。可以让子代理独立验证实现是否过拟合
5. **提交代码**

### 写代码、截图结果、迭代

适用于视觉目标：

1. 提供截图工具（如 Puppeteer MCP）
2. 提供视觉模型（设计稿）
3. 让 Claude 实现并截图，直到匹配模型
4. 提交

### 安全的 YOLO 模式

使用 `claude --dangerously-skip-permissions` 跳过所有权限检查（如修复 lint 错误）。

::: warning 风险警告
此模式有数据丢失或系统损坏风险。建议在**无网络访问的容器**中运行。
:::

### 代码库问答

用于新项目上手，询问你会在结对编程中问的问题：

- 日志是如何工作的？
- 如何创建新的 API 端点？
- 这段代码处理的边缘情况是什么？

### 使用 Claude 与 Git 交互

Anthropic 工程师 90% 的 git 操作由 Claude 完成：

- 搜索 git 历史（如 "谁拥有这个功能？"）
- 撰写提交信息
- 处理复杂操作（解决冲突、应用补丁）

#### Commit / Push 工作流最佳实践

**不需要为 commit 和 commit-push 单独创建 Skill。** 理由如下：

1. **Claude 原生能力已覆盖**：Claude Code 天然擅长生成 [Conventional Commits](https://www.conventionalcommits.org/) 格式的提交信息，直接告诉它 "commit" 或 "commit and push" 即可
2. **官方插件已有 [`commit-commands`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/commit-commands)**：可通过 `/plugin install commit-commands@claude-plugins-official` 安装，提供三个命令：
   - `/commit` — 分析变更并生成提交信息，自动避免提交敏感文件
   - `/commit-push-pr` — commit + push + 创建 PR 一步到位
   - `/clean_gone` — 清理本地已被删除的远程分支
3. **现有 Skills 已覆盖相关场景**：
   - `review-staged` — commit 前审查暂存区变更，支持 `--fix` 自动修复
   - `fix-issue` — 包含 commit → push → create PR 完整流程
   - `pr-cycle` — 完整的 commit → push → PR → review 生命周期

推荐的 commit 工作流组合：

```bash
# 1. 暂存变更
git add -A  # 或选择性暂存

# 2. 提交前审查（可选但推荐）
/ai-coding:review-staged --fix

# 3. 让 Claude 直接 commit + push
# 直接用自然语言即可，无需专门的 skill
> commit and push
```

::: tip 何时该用 Skill，何时不该
Skill 适合**需要多步编排**的复杂工作流（如 PR 生命周期、代码审查循环、[任务收尾](/guide/skills/wrap-up)）。对于 `git commit` 和 `git push` 这样的**原子操作**，Claude 的原生能力已经足够好，额外封装 Skill 反而增加了不必要的间接层。
:::

### 使用 Claude 与 GitHub 交互

- 创建 PR（理解 "pr" 简写）
- 一键修复代码审查评论
- 修复构建失败或 linter 警告
- 分类和整理 Issues

串起「修复 Issue → Draft PR → 处理 Review」的完整流程见 [Issue → PR → Review 自动化](/practices/pr-automation)。

### 使用 Claude 处理 Jupyter Notebooks

Claude 可以解释输出（包括图片）。建议在 VS Code 中并排打开 `.ipynb` 文件。可以让 Claude 整理或美化笔记本（使用 "aesthetically pleasing" 提示）。

## 4. 优化你的工作流

### 指令要具体

具体的指令能显著提高成功率，避免后期纠偏。

- ❌ **差**：`add tests for foo.py`
- ✅ **好**：`write a new test case for foo.py, covering the edge case where the user is logged out. avoid mocks`

### 给 Claude 图片

- 粘贴截图（macOS: `cmd+ctrl+shift+4`，然后 `ctrl+v` 粘贴）
- 拖拽图片
- 提供图片文件路径

### 提及文件名

使用 Tab 补全快速引用文件或文件夹。

### 给 Claude URLs

粘贴 URL 让 Claude 获取。可以使用 `/permissions` 将域名加入白名单以避免重复提示。

### 尽早且经常纠偏

作为积极的协作者参与：

- 让 Claude 先做计划，再写代码
- 按 `Escape` 中断 Claude 任何阶段
- 双击 `Escape` 回退历史记录并编辑提示
- 让 Claude 撤销更改

### 使用 `/clear` 保持上下文聚焦

在长会话中，上下文窗口可能充斥无关内容。在任务之间频繁使用 `/clear` 重置。

### 一个任务一个会话

`/clear` 更进一步的做法是：每个任务开一个新会话，做完就归档（桌面版）或结束。这和「一个任务一个分支、一个 PR」是同一个道理：

- **上下文干净**：上一个任务读过的文件、走过的弯路不会干扰下一个任务的判断；
- **成本更低**：长会话每一轮都要带上全部历史，接近上限时还会被压缩，细节可能丢失或走样；
- **便于追溯**：一个会话只对应一件事，以后搜索 transcript 时边界清楚。

需要注意的是，归档前要先沉淀信息：会话归档后，里面的内容不会再被读到，下一个会话只能看到仓库的状态。

1. **确认提交范围**：只提交本任务的改动，避免把无关文件一起带上；worktree 会话归档时会清理工作目录，务必先提交；
2. **记录结论**：设计决策和踩过的坑写进 `AGENTS.md`、计划文档或 commit message；
3. **沉淀偏好**：跨任务反复出现的纠正和偏好写进 memory；
4. **登记后续事项**：未完成的工作写成 TODO、Issue 或新会话，不要只留在聊天记录里。

如果任务刚做完、很可能马上要追加修改（例如等待 Review），可以先保留会话，因为此时上下文还有用。

这几步可以用 [`wrap-up`](/guide/skills/wrap-up) 一次完成：`/wrap-up` 会校验、沉淀、只提交本任务改动，最后归档会话。走 PR 流程的任务，也可以开启「PR 合并或关闭后自动归档」。

### 使用清单和草稿本处理复杂工作流

对于大型任务（如迁移、修复大量 lint 错误），让 Claude 使用 Markdown 文件或 GitHub Issue 作为清单和草稿本。

### 将数据传入 Claude

- 直接复制粘贴
- 管道传入 (`cat foo.txt | claude`)
- 让 Claude 通过 bash/MCP 拉取数据
- 让 Claude 读取文件或 URL

### 用 `!` 直接执行命令

交互模式中以 `!` 开头可直接运行 Bash 命令，不经 Claude 解释或批准，命令和输出会进入对话上下文：

```bash
! npm test
! git status
```

长时间运行的命令可按 `Ctrl+B` 移至后台（Tmux 中按两次）；输入部分命令后按 `Tab`，可从本项目历史 `!` 命令中补全。

### 常用快捷命令

| 命令           | 作用                                       |
| -------------- | ------------------------------------------ |
| `!<command>`   | 直接执行 Bash 命令，输出纳入对话上下文     |
| `#`            | 将内容写入 `CLAUDE.md` 记忆文件            |
| `/clear`       | 清除当前对话上下文                         |
| `/permissions` | 管理工具权限白名单                         |
| `/plugin`      | 打开插件管理器（发现、已安装、市场、错误） |

插件与市场的完整命令见 [Marketplace — 管理市场与插件](/guide/marketplace#管理市场与插件)。

## 5. 使用无头模式自动化基础设施

使用 `-p` 标志启用非交互式模式（如 CI、pre-commit hooks）。

### 用于 Issue 分类

由 GitHub 事件触发自动化，例如自动为新 Issue 打标签。

### 作为 Linter

提供主观代码审查，检测传统 linter 无法发现的问题（如拼写错误、误导性命名等）。

## 6. 多 Claude 工作流升级

### 一个写代码，另一个验证

- Claude A 写代码
- Claude B 审查或测试
- Claude C（或清除后）根据反馈编辑代码

分离上下文通常比单个 Claude 处理所有事情效果更好。

### 使用多个代码检出

创建 3-4 个 git checkouts，在不同终端标签页中分别运行 Claude 处理不同任务，循环检查进度。

### 使用 Git Worktrees 实现并行处理

Git Worktree 允许在同一仓库的不同目录中检出多个分支，共享 `.git` 对象数据库，是多 Claude 并行开发的最佳搭档。详见 [Git Worktree 并行处理](/claude-code/git-worktree)。

### 结合无头模式与自定义工具

**扇出**：处理大规模迁移。让 Claude 生成任务列表，然后循环调用 Claude 处理每个任务。

**流水线**：`claude -p "prompt" --json | your_command`，集成到现有处理管线中。

## 总结

Claude Code 是一个强大的工具，其核心在于灵活性和可定制性。通过精心配置 `CLAUDE.md`、掌握特定工作流（如 TDD 和迭代截图）、以及利用多实例并行处理，开发者可以大幅提升编码效率。建议从保守的权限设置开始，逐步探索适合自己团队的工作模式。
