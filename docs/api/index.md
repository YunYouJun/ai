# API 文档

本节提供项目相关的 API 接口文档和使用说明。

## 概述

这里记录了常用的 AI API 接口、SDK 使用方法和集成示例。

## 主流 AI API

### Anthropic Claude API

Claude 是 Anthropic 开发的 AI 助手，提供强大的对话和内容生成能力。

**官方文档：** [docs.anthropic.com](https://docs.anthropic.com/)

#### 基础调用

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const message = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Hello, Claude!' },
  ],
})

console.log(message.content)
```

#### 流式响应

```typescript
const stream = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true,
})

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    process.stdout.write(event.delta.text)
  }
}
```

#### 工具调用

```typescript
const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  tools: [
    {
      name: 'get_weather',
      description: '获取指定城市的天气信息',
      input_schema: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称',
          },
        },
        required: ['city'],
      },
    },
  ],
  messages: [
    { role: 'user', content: '北京今天天气怎么样？' },
  ],
})
```

### OpenAI API

OpenAI 提供 GPT 系列模型的 API 接口。

**官方文档：** [platform.openai.com/docs](https://platform.openai.com/docs)

#### Chat Completions

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ],
})

console.log(completion.choices[0].message.content)
```

#### 流式响应

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true,
})

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '')
}
```

## SDK 参考

### Vercel AI SDK

统一的 AI SDK，支持多个提供商。

**官方文档：** [sdk.vercel.ai](https://sdk.vercel.ai/)

#### 安装

```bash
pnpm add ai @ai-sdk/anthropic @ai-sdk/openai
```

#### 基础使用

```typescript
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const { text } = await generateText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  prompt: 'What is the meaning of life?',
})

console.log(text)
```

#### React 集成

```typescript
'use client'

import { useChat } from 'ai/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}
          :
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Say something..."
        />
      </form>
    </div>
  )
}
```

## API 最佳实践

### 1. 错误处理

```typescript
try {
  const response = await client.messages.create({...})
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
```

### 2. 重试策略

```typescript
import { retry } from '@anthropic-ai/sdk/core'

const response = await retry(
  () => client.messages.create({...}),
  {
    maxRetries: 3,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}`, error)
    },
  }
)
```

### 3. 速率限制

```typescript
import pLimit from 'p-limit'

const limit = pLimit(5) // 最多 5 个并发请求

const tasks = prompts.map(prompt =>
  limit(() => client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  }))
)

const results = await Promise.all(tasks)
```

## 环境变量

### 配置 API Keys

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
```

### 读取配置

```typescript
import { config } from 'dotenv'

config()

const anthropicKey = process.env.ANTHROPIC_API_KEY
const openaiKey = process.env.OPENAI_API_KEY
```

## 费用优化

### 1. 选择合适的模型

```typescript
// 简单任务使用较小模型
const response = await client.messages.create({
  model: 'claude-3-haiku-20240307', // 更便宜
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
})
```

### 2. 控制 Token 使用

```typescript
const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 500, // 限制输出长度
  messages: [{ role: 'user', content: prompt }],
})
```

### 3. 缓存结果

```typescript
const cache = new Map<string, string>()

async function cachedGenerate(prompt: string) {
  if (cache.has(prompt)) {
    return cache.get(prompt)
  }

  const response = await client.messages.create({...})
  cache.set(prompt, response.content[0].text)
  return response.content[0].text
}
```

## 相关资源

- [开发指南](/guide/)
- [工具资源](/tools/)
- [项目案例](/examples/)
