# Plugins

> Plugins 是将 Skills、Agents、Hooks 和 MCP Servers 打包分发的完整扩展单元，通过 `.claude-plugin/plugin.json` 清单文件定义。

## 什么是 Plugin？

Plugin 是 Claude Code 的**完整扩展包**。一个 Plugin 可以包含多个 Skills、Agents、Hooks 和 MCP/LSP Servers，并带有命名空间以防止冲突。

与独立 [Skills](./skills) 相比，Plugin 支持：

- **命名空间隔离** — 命令自动带 `plugin-name:command` 前缀
- **语义版本控制** — 通过 `plugin.json` 管理版本
- **一键安装** — 从 [Marketplace](./marketplace) 安装或通过 `--plugin-dir` 加载
- **组合能力** — 将 Skills、Agents、Hooks、MCP/LSP Servers 打包为一体

## Plugin 完整结构

一个标准的 Plugin 目录结构：

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # 清单文件（必需）
├── commands/                 # 命令 Skills（用户显式调用）
│   └── hello.md
├── skills/                   # Agent Skills（AI 自动调用）
│   └── code-review/
│       └── SKILL.md
├── agents/                   # 自定义 Agent 定义
│   └── reviewer.md
├── hooks/                    # 事件处理程序
│   └── hooks.json
├── .mcp.json                 # MCP Server 配置
├── .lsp.json                 # LSP Server 配置（代码智能）
└── README.md                 # 插件文档
```

### Plugin 清单文件 (`plugin.json`)

位于 `.claude-plugin/plugin.json`，是 Plugin 的唯一必需文件：

```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": { "name": "Your Name" },
  "homepage": "https://github.com/your/repo",
  "repository": "https://github.com/your/repo",
  "license": "MIT",
  "keywords": ["greeting", "demo"]
}
```

### 组件目录说明

| 目录/文件 | 位置 | 用途 |
| --- | --- | --- |
| `.claude-plugin/` | 根目录 | 包含 `plugin.json` 清单（标识为 Plugin） |
| `commands/` | 根目录 | 命令 Skills（Markdown 文件，用户通过 `/` 调用） |
| `skills/` | 根目录 | Agent Skills（含 `SKILL.md`，AI 可自动触发） |
| `agents/` | 根目录 | 自定义 Agent 定义 |
| `hooks/` | 根目录 | `hooks.json` 中的事件处理程序（如 `PostToolUse`） |
| `.mcp.json` | 根目录 | MCP Server 配置 |
| `.lsp.json` | 根目录 | LSP Server 配置（提供跳转定义、类型检查等代码智能） |

::: warning 目录位置
Plugin 的组件（skills、commands、agents 等）应放在 Plugin **根目录**，而非 `.claude-plugin/` 内部。
:::

## 完整 Plugin 创建步骤

### 1. 初始化目录结构

```bash
mkdir my-plugin
cd my-plugin

# 创建清单
mkdir .claude-plugin
cat > .claude-plugin/plugin.json << 'EOF'
{
  "name": "my-plugin",
  "description": "Description of your plugin",
  "version": "1.0.0",
  "author": { "name": "Your Name" },
  "homepage": "https://github.com/you/my-plugin",
  "repository": "https://github.com/you/my-plugin",
  "license": "MIT",
  "keywords": ["your", "keywords"]
}
EOF
```

### 2. 添加 Skills

```bash
# 添加命令 Skill（用户通过 /hello 调用）
mkdir -p commands
cat > commands/hello.md << 'EOF'
---
name: hello
description: "A simple greeting command"
---

Say hello to $ARGUMENTS with a friendly message.
EOF

# 添加 Agent Skill（AI 可自动调用）
mkdir -p skills/code-review
cat > skills/code-review/SKILL.md << 'EOF'
---
name: code-review
description: "Review code changes for quality and best practices"
---

Review the current code changes and provide feedback.

## Instructions

1. Get the diff: `git diff --staged` or `git diff`
2. Analyze for: bugs, security issues, style, performance
3. Categorize findings as: must-fix, should-fix, optional
4. Report findings with file locations and suggestions
EOF
```

### 3. 添加 Hooks（可选）

```bash
mkdir -p hooks
cat > hooks/hooks.json << 'EOF'
{
  "hooks": [
    {
      "event": "PostToolUse",
      "matcher": { "tool_name": "Edit" },
      "script": "pnpm lint --fix $FILE_PATH"
    }
  ]
}
EOF
```

### 4. 添加 MCP Server（可选）

```bash
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "my-service": {
      "command": "npx",
      "args": ["my-mcp-server"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
EOF
```

### 5. 本地测试

```bash
# 使用 --plugin-dir 标志本地测试
claude --plugin-dir ./my-plugin

# 验证命令是否可用
# 输入 /my-plugin:hello World
```

### 6. 验证 Plugin

```bash
# 验证目录结构和 JSON 格式
claude plugin validate .
# 或在 Claude Code 内
/plugin validate .
```

### 7. 准备发布

```bash
# 添加 README 文档
echo "# My Plugin\n\nDescription and usage..." > README.md

# 使用语义版本控制
# 更新 plugin.json 中的 version 字段

# 推送到 Git 仓库
git init && git add . && git commit -m "feat: initial plugin"
git remote add origin https://github.com/you/my-plugin.git
git push -u origin main
```

发布到 Marketplace 的流程，详见 [Marketplace 市场 — 创建与分发](./marketplace#创建与分发-marketplace)。

## 推荐常用插件

以下是官方市场 (`claude-plugins-official`) 中推荐的常用插件：

### 开发工作流

为常见开发任务添加命令和代理的插件：

| 插件 | 说明 | 安装命令 |
| --- | --- | --- |
| `commit-commands` | Git 提交工作流，包括提交、推送和 PR 创建 | `/plugin install commit-commands@claude-plugins-official` |
| `pr-review-toolkit` | 用于审查拉取请求的专门代理 | `/plugin install pr-review-toolkit@claude-plugins-official` |
| `agent-sdk-dev` | 使用 Claude Agent SDK 构建的工具 | `/plugin install agent-sdk-dev@claude-plugins-official` |
| `plugin-dev` | 用于创建您自己的插件的工具包 | `/plugin install plugin-dev@claude-plugins-official` |

### 代码智能（LSP 集成）

使用 LSP 提供跳转定义、查找引用、类型错误检测：

| 插件 | 语言 | 需要安装 |
| --- | --- | --- |
| Python LSP | Python | `pyright-langserver` (`pip install pyright`) |
| Go LSP | Go | `gopls` (`go install golang.org/x/tools/gopls@latest`) |
| Rust LSP | Rust | `rust-analyzer` (随 `rustup` 安装) |
| TypeScript LSP | TypeScript | `typescript-language-server` (`npm i -g typescript-language-server`) |

::: tip 代码智能插件
代码智能插件需要在系统上安装对应的语言服务器二进制文件。安装后 Claude 可以获得跳转定义、查找引用、诊断错误等能力。
:::

### 外部集成（MCP Servers）

捆绑预配置的 MCP 服务器，连接外部服务：

| 插件 | 连接服务 | 用途 |
| --- | --- | --- |
| GitHub | GitHub API | Issue、PR、仓库管理 |
| GitLab | GitLab API | 项目、MR 管理 |
| Jira | Jira Cloud | 任务管理 |
| Linear | Linear API | 项目跟踪 |
| Notion | Notion API | 知识库、文档 |
| Figma | Figma API | 设计稿获取 |
| Vercel | Vercel API | 部署管理 |
| Slack | Slack API | 消息通知 |
| Sentry | Sentry API | 错误追踪 |

### 输出样式

自定义 Claude 的响应方式：

| 插件 | 说明 |
| --- | --- |
| `explanatory-output-style` | 教育性输出风格，添加解释性见解 |
| `learning-output-style` | 交互式学习风格，鼓励探索 |

## 从现有配置迁移到 Plugin

如果已有 `.claude/` 目录下的独立配置，可以迁移为 Plugin 格式：

1. 创建 `.claude-plugin/plugin.json` 清单文件
2. 将 `.claude/commands/` 中的命令移至 Plugin 根目录的 `commands/`
3. 将 `.claude/skills/` 中的技能移至 Plugin 根目录的 `skills/`
4. 将 `hooks` 配置从 `settings.json` 迁移至 `hooks/hooks.json`
5. 将 MCP 配置提取到 `.mcp.json`
6. 使用 `--plugin-dir` 或 `claude plugin validate .` 测试验证

迁移前后对比：

| 迁移前（独立配置） | 迁移后（Plugin） |
| --- | --- |
| `.claude/commands/hello.md` | `commands/hello.md` |
| `.claude/skills/review/SKILL.md` | `skills/review/SKILL.md` |
| `.claude/settings.json` 中的 hooks | `hooks/hooks.json` |
| Skill 名 `/hello` | `/plugin-name:hello` |

## 故障排除

| 问题 | 解决方案 |
| --- | --- |
| `/plugin` 命令无法识别 | 检查版本 >= 1.0.33（`claude --version`），更新并重启终端 |
| 插件技能未出现 | 清除缓存 `rm -rf ~/.claude/plugins/cache`，重启并重新安装 |
| `Executable not found in $PATH` | 安装对应的语言服务器二进制文件（如 `pyright`, `gopls`） |
| Plugin 加载错误 | 运行 `/plugin` → 切换到「错误」选项卡查看详情 |
| 命名空间冲突 | 使用 Plugin 方式加载（自动带命名空间前缀） |
| 安装后文件未找到 | 插件会被复制到缓存目录，无法引用插件目录外的文件（如 `../shared`），需使用符号链接或重构 |

## 参考链接

- [Skills](./skills) — Skill 编写与使用
- [Marketplace 市场](./marketplace) — 发现、安装、创建与分发市场
- [创建插件 — Claude Code 官方文档](https://code.claude.com/docs/zh-CN/plugins)
- [Claude Code Skills 官方文档](https://docs.anthropic.com/en/docs/claude-code/skills)
- [vercel-labs/skills](https://github.com/vercel-labs/skills) — Skills CLI 安装工具
- [PR 自动化实践](/claude-code/pr-automation) — Skills 在 PR 工作流中的实际应用
