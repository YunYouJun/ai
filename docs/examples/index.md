# 项目案例

本节展示实际的 AI 项目案例，包括实现方案和代码示例。

## 案例列表

### [Agent Browser](./agent-browser.md)

基于 Vercel AI SDK 的浏览器自动化 Agent。

**技术栈：** TypeScript + Playwright + Vercel AI SDK

**特点：**

- 🤖 AI 驱动的浏览器操作
- 🎯 自然语言指令
- 📸 自动截图和分析
- 🔧 工具函数集成

### [Browser Use](./browser-use.md)

Python 实现的浏览器自动化库。

**技术栈：** Python + Playwright + Anthropic Claude

**特点：**

- 🐍 Python 原生支持
- 🌐 复杂网页交互
- 📊 数据提取
- 🔄 多步骤任务

## 使用场景

### Web 自动化

- 数据采集和爬虫
- 自动化测试
- 表单填写
- 页面监控

### AI Agent

- 任务规划和执行
- 工具调用
- 多模态交互
- 自主决策

### 数据处理

- 文档解析
- 信息提取
- 数据清洗
- 报告生成

## 项目结构

典型的 AI 项目结构：

```
project/
├── src/
│   ├── agents/        # Agent 实现
│   │   └── browser.ts
│   ├── tools/         # 工具函数
│   │   ├── screenshot.ts
│   │   └── extract.ts
│   └── prompts/       # Prompt 模板
│       └── system.ts
├── examples/          # 使用示例
│   └── demo.ts
└── tests/            # 测试文件
    └── agent.test.ts
```

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd project
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，添加 API Key
```

### 4. 运行示例

```bash
pnpm run demo
```

## 更多案例

查看各个案例的详细文档：

- [Agent Browser 详解](./agent-browser.md)
- [Browser Use 详解](./browser-use.md)

## 贡献案例

如果你有优秀的 AI 项目案例，欢迎贡献！

1. Fork 本仓库
2. 创建案例文档
3. 提交 Pull Request

## 相关资源

- [开发指南](/guide/)
- [工具资源](/tools/)
- [API 文档](/api/)
