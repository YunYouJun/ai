# 开发工具

推荐一些能够提升 AI 开发效率的实用工具。

## AI 编码工具

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

### v0

Vercel 推出的 AI UI 生成工具，用自然语言生成前端组件。

**官网：** [v0.dev](https://v0.dev/)

## 浏览器自动化

- [Agent Browser](./agent-browser) — 面向 AI 编程助手的浏览器自动化，与 Playwright MCP 的取舍
- [Browser Use](./browser-use) — Python 实现，用自然语言驱动浏览器完成复杂任务

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

## 相关资源

- [推荐组合](/tools/#推荐组合)
- [AI 框架与 SDK](./frameworks)
- [学习资源](./resources)
