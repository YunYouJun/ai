# AI 框架与 SDK

介绍主流的 AI 开发框架和 SDK，帮助你选择合适的工具构建 AI 应用。直接调用模型 API 的写法见 [API 调用实践](./api)。

## LangChain

### 简介

LangChain 是一个用于开发由语言模型驱动的应用程序的框架。

**官方文档：** [docs.langchain.com](https://docs.langchain.com/oss/python/langchain/overview)

### 特点

- 🔗 **链式调用** - 组合多个 LLM 调用
- 📚 **文档加载** - 支持多种数据源
- 🧠 **记忆管理** - 对话历史管理
- 🔧 **工具集成** - 丰富的工具生态

### 安装

```bash
# Python
pip install langchain langchain-openai

# JavaScript
pnpm add langchain @langchain/core @langchain/openai
```

### 示例

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# 创建聊天模型
chat = ChatOpenAI(model="gpt-6-astra")

# 创建提示模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有帮助的助手"),
    ("user", "{input}")
])

# 创建链
chain = prompt | chat

# 调用
response = chain.invoke({"input": "你好"})
print(response.content)
```

LangChain 1.x 起，模型类从各自的提供商包导入（如 `langchain_openai`、`langchain_anthropic`），旧的 `from langchain.chat_models import ChatOpenAI` 已不可用；不想绑定提供商时可以用 `init_chat_model("openai:gpt-6-astra")`。

### Agent

1.x 用 `create_agent` 构建带工具调用的 Agent：

```python
from langchain.agents import create_agent

def get_weather(city: str) -> str:
    """获取指定城市的天气"""
    return f"{city}今天晴"

agent = create_agent(
    model="openai:gpt-6-astra",
    tools=[get_weather],
    system_prompt="你是一个有帮助的助手",
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "北京今天天气怎么样？"}]}
)
print(result["messages"][-1].content)
```

## Vercel AI SDK

### 简介

Vercel AI SDK 是一个用于构建 AI 应用的 TypeScript 工具包。

**官方文档：** [ai-sdk.dev](https://ai-sdk.dev/)

### 特点

- ⚡ **流式响应** - 实时流式输出
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🔌 **多模型支持** - 支持多个 AI 提供商
- 🎨 **UI 集成** - 内置 React Hooks

### 安装

```bash
pnpm add ai @ai-sdk/anthropic
```

当前大版本为 v7，要求 Node.js 22+，且只提供 ESM。

### 示例

```typescript
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const { text } = await generateText({
  model: anthropic('claude-opus-5-5'), // 默认读取 ANTHROPIC_API_KEY
  prompt: '介绍一下自己',
})

console.log(text)
```

### React 集成

需要额外安装 `@ai-sdk/react`。`useChat` 默认请求 `/api/chat`，先写服务端路由（Next.js App Router）：

```typescript
// app/api/chat/route.ts
import type { UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from 'ai'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: anthropic('claude-opus-5-5'),
    messages: await convertToModelMessages(messages),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
```

客户端组件里，输入框状态由自己管理，消息内容按 `parts` 渲染：

```tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

export default function Chat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage } = useChat()

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.parts.map((part, i) =>
            part.type === 'text' ? <span key={i}>{part.text}</span> : null,
          )}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage({ text: input })
          setInput('')
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.currentTarget.value)}
          placeholder="Say something..."
        />
      </form>
    </div>
  )
}
```

## LlamaIndex

### 简介

LlamaIndex 是一个数据框架，用于将自定义数据连接到大型语言模型。

**官方文档：** [developers.llamaindex.ai](https://developers.llamaindex.ai/python/framework/)

### 特点

- 📊 **数据索引** - 高效的数据检索
- 🔍 **向量搜索** - 语义搜索能力
- 📝 **文档解析** - 多格式文档支持
- 🎯 **RAG 支持** - 检索增强生成

### 安装

```bash
pip install llama-index
```

### 示例

```python
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex

# 加载文档
documents = SimpleDirectoryReader('data').load_data()

# 创建索引
index = VectorStoreIndex.from_documents(documents)

# 查询
query_engine = index.as_query_engine()
response = query_engine.query("文档内容是什么？")
print(response)
```

默认使用 OpenAI 的模型生成回答和向量，运行前需要设置 `OPENAI_API_KEY`；换用其他模型需安装对应的 `llama-index-llms-*` 和 `llama-index-embeddings-*` 包。

## Anthropic SDK

### 简介

Anthropic 官方 SDK，用于访问 Claude 模型。

### 特点

- 🎯 **官方支持** - Anthropic 官方维护
- 🔒 **类型安全** - 完整的类型定义
- 📡 **流式支持** - 支持流式响应
- 🛠️ **工具调用** - 支持 Function Calling

### 安装

```bash
# Python
pip install anthropic

# TypeScript
pnpm add @anthropic-ai/sdk
```

### 示例

基础调用、流式响应和工具调用示例见 [API 调用实践](./api#anthropic-claude-api)。

## 框架对比

| 框架          | 语言       | 学习曲线 | 适用场景     |
| ------------- | ---------- | -------- | ------------ |
| LangChain     | Python/JS  | 中等     | 复杂 AI 应用 |
| Vercel AI SDK | TypeScript | 简单     | Web 应用     |
| LlamaIndex    | Python/JS  | 中等     | RAG 应用     |
| Anthropic SDK | Python/JS  | 简单     | Claude 集成  |

## 选择建议

- **Web 应用** → Vercel AI SDK
- **数据分析** → LangChain + LlamaIndex
- **简单集成** → Anthropic SDK
- **复杂 Agent** → LangChain

## 相关资源

- [API 调用实践](./api)
- [开发工具](./dev-tools)
- [学习资源](./resources)
