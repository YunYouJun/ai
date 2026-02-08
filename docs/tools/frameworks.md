# AI 框架

介绍主流的 AI 开发框架和 SDK，帮助你选择合适的工具构建 AI 应用。

## LangChain

### 简介

LangChain 是一个用于开发由语言模型驱动的应用程序的框架。

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
pnpm add langchain @langchain/openai
```

### 示例

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

# 创建聊天模型
chat = ChatOpenAI(model="gpt-4")

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

## Vercel AI SDK

### 简介

Vercel AI SDK 是一个用于构建 AI 应用的 TypeScript 工具包。

### 特点

- ⚡ **流式响应** - 实时流式输出
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🔌 **多模型支持** - 支持多个 AI 提供商
- 🎨 **UI 集成** - 内置 React Hooks

### 安装

```bash
pnpm add ai @ai-sdk/anthropic
```

### 示例

```typescript
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const { text } = await generateText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  prompt: '介绍一下自己',
})

console.log(text)
```

## LlamaIndex

### 简介

LlamaIndex 是一个数据框架，用于将自定义数据连接到大型语言模型。

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
from llama_index import VectorStoreIndex, SimpleDirectoryReader

# 加载文档
documents = SimpleDirectoryReader('data').load_data()

# 创建索引
index = VectorStoreIndex.from_documents(documents)

# 查询
query_engine = index.as_query_engine()
response = query_engine.query("文档内容是什么？")
print(response)
```

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

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const message = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: '你好' },
  ],
})

console.log(message.content)
```

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

- [开发工具](./dev-tools.md)
- [学习资源](./resources.md)
