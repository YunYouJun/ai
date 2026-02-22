# 快速开始

本指南将帮助你快速搭建 AI 开发环境，并创建第一个 AI 项目。

## 前置要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js** >= 18.0.0
- **Python** >= 3.9
- **Git** 版本控制工具
- 代码编辑器（推荐 VS Code）

## 安装依赖

### 1. 安装 Node.js 和 pnpm

```bash
# 使用 nvm 安装 Node.js
nvm install 18
nvm use 18

# 安装 pnpm
npm install -g pnpm
```

### 2. 安装 Python 和 pip

```bash
# macOS
brew install python@3.11

# Linux
sudo apt-get install python3.11

# 验证安装
python3 --version
pip3 --version
```

## 创建项目

### 使用 pnpm 创建项目

```bash
# 创建项目目录
mkdir my-ai-project
cd my-ai-project

# 初始化 package.json
pnpm init

# 安装开发依赖
pnpm add -D typescript @types/node
```

### 使用 Python 创建虚拟环境

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# macOS/Linux
source venv/bin/activate

# Windows
.\venv\Scripts\activate

# 安装依赖
pip install openai anthropic
```

## 第一个 AI 应用

创建一个简单的 AI 聊天应用：

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function chat(message: string) {
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: message },
    ],
  })

  console.log(response.content)
}

chat('你好，介绍一下自己')
```

## 运行项目

```bash
# 设置环境变量
export ANTHROPIC_API_KEY=your_api_key_here

# 运行项目
tsx index.ts
```

## 下一步

- 学习 [最佳实践](./best-practices.md)
- 探索 [工具资源](/tools/)
