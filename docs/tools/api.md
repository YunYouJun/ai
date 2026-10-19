# API 调用实践

直接调用模型 API 时的常用写法：基础调用、流式响应、工具调用，以及错误处理、限流、密钥配置和费用控制。框架与 SDK 的选型见 [AI 框架与 SDK](./frameworks)。

## 主流 AI API

### Anthropic Claude API

Claude 是 Anthropic 开发的 AI 助手，提供强大的对话和内容生成能力。

**官方文档：** [platform.claude.com/docs](https://platform.claude.com/docs/)

可用模型及其 ID 以官方 [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview) 为准，下文示例使用 `claude-opus-5-5`。

#### 基础调用

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // 默认就读取这个环境变量，可省略
})

const message = await client.messages.create({
  model: 'claude-opus-5-5',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Hello, Claude!' },
  ],
})

// content 是内容块数组（可能包含 thinking 等块），按 type 取出文本
for (const block of message.content) {
  if (block.type === 'text') {
    console.log(block.text)
  }
}
```

#### 流式响应

```typescript
const stream = client.messages
  .stream({
    model: 'claude-opus-5-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello!' }],
  })
  .on('text', (text) => {
    process.stdout.write(text)
  })

// 流结束后拿到完整消息（含 usage）
const finalMessage = await stream.finalMessage()
```

只需要原始事件、不需要 SDK 帮忙拼装最终消息时，也可以用 `client.messages.create({ ..., stream: true })`，遍历事件时判断 `event.type === 'content_block_delta' && event.delta.type === 'text_delta'`。

#### 工具调用

```typescript
const response = await client.messages.create({
  model: 'claude-opus-5-5',
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

// stop_reason 为 'tool_use' 时，执行对应工具，再把结果作为 tool_result 发回
if (response.stop_reason === 'tool_use') {
  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
  )
  console.log(toolUse?.name, toolUse?.input) // get_weather { city: '北京' }
}
```

不想手写这个循环，可以用 SDK 的 `client.beta.messages.toolRunner()` 配合 `betaZodTool` 定义工具，由 SDK 自动执行工具并继续对话，见 [TypeScript SDK 文档](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript)。

### OpenAI API

OpenAI 提供 GPT 系列模型的 API 接口。

**官方文档：** [developers.openai.com/api/docs](https://developers.openai.com/api/docs)

#### Responses API

OpenAI 推荐新项目使用 Responses API；Chat Completions（`openai.chat.completions.create`）仍会长期支持。

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const response = await openai.responses.create({
  model: 'gpt-6-astra',
  instructions: 'You are a helpful assistant.',
  input: 'Hello!',
})

console.log(response.output_text)
```

#### 流式响应

```typescript
const stream = await openai.responses.create({
  model: 'gpt-6-astra',
  input: 'Hello!',
  stream: true,
})

for await (const event of stream) {
  if (event.type === 'response.output_text.delta') {
    process.stdout.write(event.delta)
  }
}
```

## API 最佳实践

### 1. 错误处理

SDK 会按状态码抛出不同的错误类，用 `instanceof` 判断，不要去匹配错误信息字符串：

```typescript
import Anthropic from '@anthropic-ai/sdk'

try {
  const response = await client.messages.create({...})
}
catch (error) {
  if (error instanceof Anthropic.RateLimitError) {
    // 429：触发速率限制
    console.error('Rate limit exceeded')
  }
  else if (error instanceof Anthropic.InternalServerError) {
    // 5xx：服务端错误
    console.error('Server error')
  }
  else if (error instanceof Anthropic.APIError) {
    console.error(`API error ${error.status}:`, error.message)
  }
  throw error
}
```

其他常见错误类：`BadRequestError`（400）、`AuthenticationError`（401）、`PermissionDeniedError`（403）、`NotFoundError`（404）、`APIConnectionError`（网络错误）。

### 2. 重试策略

SDK 内置了指数退避重试，默认重试 2 次，覆盖连接错误、408、409、429 和 5xx，不需要自己再包一层：

```typescript
// 全局配置
const client = new Anthropic({
  maxRetries: 5, // 默认 2，设为 0 关闭重试
  timeout: 60 * 1000, // 单位毫秒，默认 10 分钟
})

// 单次请求覆盖
await client.messages.create(
  {
    model: 'claude-opus-5-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello!' }],
  },
  { maxRetries: 3 },
)
```

超时的请求同样会被重试，所以最坏耗时约为 `timeout × (maxRetries + 1)`。

### 3. 速率限制

```typescript
import pLimit from 'p-limit'

const limit = pLimit(5) // 最多 5 个并发请求

const tasks = prompts.map(prompt =>
  limit(() => client.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })),
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

Node.js 20.6+ 也可以不装 dotenv，直接用 `node --env-file=.env app.js` 加载。

## 费用优化

### 1. 选择合适的模型

```typescript
// 简单任务使用较小模型
const response = await client.messages.create({
  model: 'claude-haiku-5-5', // 更便宜、更快
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
})
```

### 2. 控制 Token 使用

```typescript
const response = await client.messages.create({
  model: 'claude-opus-5-5',
  max_tokens: 1024, // 输出上限，思考 token 也计入其中
  output_config: { effort: 'low' }, // 投入程度：low / medium / high / xhigh / max
  messages: [{ role: 'user', content: prompt }],
})
```

当前模型默认开启自适应思考，`effort` 是控制思考深度和整体 token 消耗的主要手段：简单任务调低，复杂任务调高。`max_tokens` 是硬上限，设得太小会把回答截断。

### 3. 缓存结果

```typescript
const cache = new Map<string, string>()

async function cachedGenerate(prompt: string) {
  if (cache.has(prompt)) {
    return cache.get(prompt)
  }

  const response = await client.messages.create({...})
  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('')
  cache.set(prompt, text)
  return text
}
```

### 4. Prompt Caching

请求之间重复的长前缀（系统提示、长文档、工具定义）可以交给服务端缓存，命中后这部分输入只按基础输入价的 10% 计费（Opus 5.5 / Sonnet 5.5 为 5%），缓存默认保留 5 分钟：

```typescript
const response = await client.messages.create({
  model: 'claude-opus-5-5',
  max_tokens: 1024,
  cache_control: { type: 'ephemeral' }, // 自动缓存到最后一个可缓存的块
  system: longDocument,
  messages: [{ role: 'user', content: '总结这份文档的要点' }],
})

console.log(response.usage.cache_read_input_tokens) // 命中缓存的 token 数
```

缓存是前缀匹配，前缀里任何一个字节变化（比如在系统提示里拼当前时间）都会让缓存失效；前缀太短（不足模型的最小长度）时不会缓存，也不会报错。详见 [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)。

## 相关资源

- [AI 框架与 SDK](./frameworks)
- [开发工具](./dev-tools) — API 测试、监控与本地模型
- [学习资源](./resources) — 各模型提供商的官方文档
