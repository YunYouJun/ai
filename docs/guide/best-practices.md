# 最佳实践

本文总结了 AI 开发过程中的最佳实践，帮助你构建更加可靠和可维护的 AI 应用。

## 项目结构

推荐的项目结构：

```
project/
├── src/
│   ├── agents/       # AI Agent 实现
│   ├── prompts/      # Prompt 模板
│   ├── tools/        # 工具函数
│   └── utils/        # 工具库
├── tests/            # 测试文件
├── docs/             # 文档
└── examples/         # 示例代码
```

## 代码规范

### 1. 使用 TypeScript

TypeScript 提供类型安全，减少运行时错误：

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatOptions {
  model: string
  temperature?: number
  maxTokens?: number
}

async function chat(
  messages: ChatMessage[],
  options: ChatOptions
): Promise<string> {
  // 实现
}
```

### 2. Prompt 管理

将 Prompt 模板集中管理：

```typescript
// prompts/system.ts
export const SYSTEM_PROMPTS = {
  assistant: `你是一个有帮助的 AI 助手...`,
  coder: `你是一个专业的程序员...`,
}

// 使用
const messages = [
  { role: 'system', content: SYSTEM_PROMPTS.assistant },
  { role: 'user', content: userInput },
]
```

### 3. 错误处理

优雅地处理 API 错误：

```typescript
async function callAI(prompt: string) {
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })
    return response
  } catch (error) {
    if (error.status === 429) {
      // 处理速率限制
      console.error('Rate limit exceeded')
    } else if (error.status === 500) {
      // 处理服务器错误
      console.error('Server error')
    }
    throw error
  }
}
```

## 性能优化

### 1. 使用流式响应

对于长文本生成，使用流式响应提升用户体验：

```typescript
const stream = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
  stream: true,
})

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    process.stdout.write(event.delta.text)
  }
}
```

### 2. 缓存策略

缓存常用的 AI 响应：

```typescript
const cache = new Map<string, string>()

async function cachedChat(prompt: string) {
  if (cache.has(prompt)) {
    return cache.get(prompt)
  }

  const response = await chat(prompt)
  cache.set(prompt, response)
  return response
}
```

## 安全性

### 1. API Key 管理

永远不要在代码中硬编码 API Key：

```typescript
// ❌ 错误
const apiKey = 'sk-xxx'

// ✅ 正确
const apiKey = process.env.ANTHROPIC_API_KEY
```

### 2. 输入验证

验证用户输入，防止注入攻击：

```typescript
function sanitizeInput(input: string): string {
  // 移除危险字符
  return input
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}
```

## 测试

### 单元测试

```typescript
import { describe, expect, it } from 'vitest'

describe('AI Chat', () => {
  it('should return response', async () => {
    const response = await chat('Hello')
    expect(response).toBeTruthy()
    expect(typeof response).toBe('string')
  })
})
```

## 监控和日志

记录关键操作和错误：

```typescript
async function chat(prompt: string) {
  console.log(`[${new Date().toISOString()}] User prompt:`, prompt)

  try {
    const response = await client.messages.create(...)
    console.log(`[${new Date().toISOString()}] AI response length:`, response.content.length)
    return response
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error)
    throw error
  }
}
```

## 相关资源

- [工具资源](/tools/)
