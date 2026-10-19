# API 调用实践

直接调用模型 API 时的常用写法：基础调用、流式响应、工具调用，以及错误处理、限流、密钥配置和费用控制。框架与 SDK 的选型见 [AI 框架与 SDK](./frameworks)。

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

- [AI 框架与 SDK](./frameworks)
- [开发工具](./dev-tools) — API 测试、监控与本地模型
- [学习资源](./resources) — 各模型提供商的官方文档
