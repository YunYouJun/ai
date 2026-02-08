# 开发工具

推荐一些能够提升 AI 开发效率的实用工具。

## 代码编辑器

### Cursor

AI 驱动的代码编辑器，基于 VS Code。

**特点：**

- ✨ AI 代码补全
- 💬 内置 AI 对话
- 🔍 代码库搜索
- 🎯 智能重构

**官网：** [cursor.sh](https://cursor.sh/)

### VS Code + Copilot

Visual Studio Code 配合 GitHub Copilot。

**推荐插件：**

- GitHub Copilot
- GitHub Copilot Chat
- Continue (开源 AI 助手)

## 浏览器自动化

### Browser Use

Python 库，使用 AI 控制浏览器。

```bash
pip install browser-use
```

**特点：**

- 🤖 AI 驱动的浏览器控制
- 🎯 自然语言指令
- 📸 自动截图
- 🔧 Playwright 集成

### Agent Browser

基于 Vercel AI SDK 的浏览器 Agent。

```bash
pnpm add agent-browser
```

**官网：** [github.com/vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)

## Prompt 工具

### PromptPerfect

优化和测试 Prompt 的工具。

**官网：** [promptperfect.jina.ai](https://promptperfect.jina.ai/)

### Anthropic Console

Claude 官方 Prompt 测试平台。

**官网：** [console.anthropic.com](https://console.anthropic.com/)

## API 测试

### Bruno

开源的 API 客户端，类似 Postman。

**特点：**

- 📁 Git 友好
- 🔒 离线优先
- 📝 Markdown 语法

**官网：** [usebruno.com](https://www.usebruno.com/)

### HTTPie

命令行 HTTP 客户端。

```bash
# 安装
brew install httpie

# 测试 API
http POST https://api.anthropic.com/v1/messages \
  x-api-key:$ANTHROPIC_API_KEY \
  model=claude-3-5-sonnet-20241022 \
  messages:='[{"role":"user","content":"Hello"}]' \
  max_tokens:=1024
```

## 向量数据库

### Qdrant

高性能向量数据库。

```bash
docker run -p 6333:6333 qdrant/qdrant
```

**官网：** [qdrant.tech](https://qdrant.tech/)

### Pinecone

托管向量数据库服务。

**官网：** [pinecone.io](https://www.pinecone.io/)

## 监控和调试

### LangSmith

LangChain 官方的监控平台。

**功能：**

- 📊 请求追踪
- 🐛 调试工具
- 📈 性能分析
- 💰 成本追踪

**官网：** [smith.langchain.com](https://smith.langchain.com/)

### Helicone

AI 应用监控和分析平台。

**官网：** [helicone.ai](https://www.helicone.ai/)

## 本地模型运行

### Ollama

本地运行大型语言模型。

```bash
# 安装
brew install ollama

# 运行模型
ollama run llama2
```

**官网：** [ollama.ai](https://ollama.ai/)

### LM Studio

图形化界面运行本地模型。

**官网：** [lmstudio.ai](https://lmstudio.ai/)

## 工具组合推荐

### Web 开发

```
Cursor + Bruno + Vercel AI SDK
```

### Python 开发

```
VS Code + Copilot + HTTPie + Ollama
```

### 生产环境

```
LangSmith + Qdrant + Helicone
```

## 相关资源

- [AI 框架](./frameworks.md)
- [学习资源](./resources.md)
