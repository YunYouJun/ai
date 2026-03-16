# Agent Browser

基于 [Vercel AI SDK](https://ai-sdk.dev/) 和 [Playwright](https://playwright.dev/) 的浏览器自动化 Agent，使用自然语言指令驱动浏览器操作。

- [GitHub](https://github.com/vercel-labs/agent-browser)

## 快速开始

```bash
pnpm add agent-browser @ai-sdk/anthropic playwright
```

```typescript
import { anthropic } from '@ai-sdk/anthropic'
import { createAgent } from 'agent-browser'

const agent = createAgent({
  model: anthropic('claude-3-5-sonnet-20241022'),
  browser: { headless: false },
})

const result = await agent.run({
  instruction: '打开 GitHub，搜索 vercel，并截图前三个结果',
})
```

## agent-browser vs Playwright MCP

在 AI 编程助手（如 Claude Code、Cursor）中操作浏览器时，agent-browser 相比 Playwright MCP 有明显的 **token 节省优势**：

| 对比维度       | Playwright MCP                 | agent-browser                    |
| -------------- | ------------------------------ | -------------------------------- |
| **交互方式**   | 每次操作都需 AI 发起工具调用   | 一条指令，agent 内部自主完成     |
| **上下文消耗** | snapshot 结果回传 AI，快速膨胀 | 中间状态内部消化，只返回最终结果 |
| **来回轮次**   | 简单表单可能 5-10 轮           | 通常 1 次调用                    |

**推荐 agent-browser：** 数据采集、表单填写、内容检查、批量截图等连续多步操作。

**推荐 Playwright MCP：** 细粒度 DOM 断言、网络请求拦截、已有 Playwright 测试脚本调试。

## 相关资源

- [Browser Use](./browser-use.md)
- [开发工具](./dev-tools.md)
- [开发指南](/guide/)
