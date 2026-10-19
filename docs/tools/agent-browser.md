# Agent Browser

Vercel Labs 出品的浏览器自动化命令行工具，专为 AI 编程助手设计。它本身不内置大模型，也不是 Agent 框架：由 Claude Code、Cursor、Codex 等 AI 助手通过 shell 逐条调用 `agent-browser` 命令来操作浏览器。

- 原生 Rust CLI，通过 CDP 直接驱动 Chrome / Chromium，不依赖 Playwright 或 Puppeteer
- `snapshot` 输出带 `@e1`、`@e2` 引用的无障碍树，AI 按引用点击、填写，不用自己解析 HTML
- 支持多会话隔离、登录态持久化、截图、录屏、网络拦截，也能操作 Electron 桌面应用

- [GitHub](https://github.com/vercel-labs/agent-browser) · [文档](https://agent-browser.dev/)

## 快速开始

```bash
# 安装 CLI（也可以 brew install agent-browser）
npm install -g agent-browser

# 首次使用前下载 Chrome for Testing
agent-browser install
```

核心循环是「打开 → 快照 → 按引用操作 → 页面变化后重新快照」：

```bash
agent-browser open https://duckduckgo.com
agent-browser snapshot -i               # 只列出可交互元素，每个带 @eN 引用
agent-browser fill @e1 "agent-browser"  # 用快照里的引用填写搜索框
agent-browser press Enter
agent-browser wait --load networkidle
agent-browser snapshot -i               # 页面变了，旧引用失效，重新快照
agent-browser screenshot result.png
agent-browser close
```

快照输出类似下面这样，`[ref=e2]` 对应命令里的 `@e2`：

```
- heading "Example Domain" [ref=e1] [level=1]
- button "Submit" [ref=e2]
- textbox "Email" [ref=e3]
- link "Learn more" [ref=e4]
```

浏览器在多条命令之间保持运行，一串命令就是同一个会话。常用选项：

| 选项               | 作用                                       |
| ------------------ | ------------------------------------------ |
| `--headed`         | 显示浏览器窗口（默认无头）                 |
| `--session <name>` | 独立的浏览器会话，各自隔离 Cookie 和标签页 |
| `--profile <path>` | 使用 Chrome 用户数据目录，保留登录态       |
| `--cdp <port>`     | 连接到已开启调试端口的 Chrome              |
| `--json`           | 输出 JSON，方便程序解析                    |

## 在 AI 编程助手中使用

推荐以 Skill 的方式安装，Claude Code、Codex、Cursor、Gemini CLI、GitHub Copilot 等都支持：

```bash
npx skills add vercel-labs/agent-browser
```

安装的只是一个很薄的入口，真正的用法说明由 CLI 按当前版本提供，所以不会过时：

```bash
agent-browser skills get core         # 工作流、常见用法与排错
agent-browser skills get core --full  # 附完整命令参考
```

不用 Skill 的话，也可以在 `AGENTS.md` / `CLAUDE.md` 里写一段说明，告诉助手用 `agent-browser` 做浏览器操作，并列出上面的核心循环。

支持 MCP 的客户端还可以把它作为 stdio MCP Server 接入：

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "agent-browser",
      "args": ["mcp"]
    }
  }
}
```

## agent-browser vs Playwright MCP

在 AI 编程助手（如 Claude Code、Cursor）中操作浏览器时，两者都是由 AI 一步步发起操作，差别主要在页面信息怎么交给 AI：

| 对比维度       | Playwright MCP                      | agent-browser                                         |
| -------------- | ----------------------------------- | ----------------------------------------------------- |
| **调用方式**   | MCP 工具调用，需在客户端配置 Server | shell 命令，能跑命令的助手都能直接用（也有 MCP 模式） |
| **页面表示**   | 无障碍树快照                        | 精简快照 + `@eN` 引用，`-i` 只保留可交互元素          |
| **上下文消耗** | 快照随操作回传，长流程上下文膨胀快  | 快照小，按需获取，同样的流程 token 消耗更低           |

官方给出的数据是：一次文本快照约 200–400 token，而完整 DOM 约 3000–5000 token。表中与 Playwright MCP 的对比是使用经验，并非官方测评。

**推荐 agent-browser：** 数据采集、表单填写、内容检查、批量截图等连续多步操作，以及需要多会话、保留登录态的场景。

**推荐 Playwright MCP：** 已经用 Playwright 写测试，希望 AI 的操作与现有 Playwright 脚本和断言保持一致。

## 相关资源

- [Browser Use](./browser-use.md)
- [开发工具](./dev-tools.md)
- [开发指南](/guide/)
