# AI 开发实践指南

本指南介绍如何安装和扩展 AI Coding Agent（Claude Code / CodeBuddy 等）：直接使用本仓库的 Skills，把 Skills 打包成 Plugin，再通过 Marketplace 分发；MCP 则负责接入外部数据和工具。

## 扩展方式对比

| 特性         | Skills                 | Plugins                            | Marketplace                |
| ------------ | ---------------------- | ---------------------------------- | -------------------------- |
| **定位**     | 最小功能单元           | 完整扩展包                         | 分发与发现平台             |
| **粒度**     | 单个命令/技能          | 多个 Skills + Agents + Hooks + MCP | 多个 Plugins 的目录        |
| **命名空间** | 无（独立配置时）       | 有（`plugin-name:command`）        | 有（`plugin@marketplace`） |
| **安装方式** | 复制 `SKILL.md` 到项目 | `--plugin-dir` 或市场安装          | `/plugin install`          |
| **版本管理** | 手动                   | 语义版本 (`plugin.json`)           | 自动更新                   |
| **适用场景** | 个人工作流、快速实验   | 团队共享、跨项目复用               | 社区分发、企业内部         |
| **冲突处理** | 可能冲突               | 命名空间隔离                       | 完全隔离                   |

[MCP](./mcp) 是连接外部数据源和工具的开放协议，可以单独配置，也可以通过 `.mcp.json` 随 Plugin 一起分发。

## 内容导航

- [快速开始](./getting-started) — 安装本仓库的 Skills 与 `ai-coding` 插件
- [Skills 目录](./skills) — 按场景浏览全部 Skills；自己编写见[编写 Skill](./skills/authoring)
- [Plugins](./plugins) — Plugin 结构、创建步骤与本仓库插件
- [Marketplace](./marketplace) — 添加市场、安装与管理插件、官方推荐插件、自建市场
- [MCP](./mcp) — 协议概述、核心概念与安全

Claude Code 的使用技巧见 [Claude Code](/claude-code/)，基于这些 Skills 的端到端流程见[自动化实践](/practices/pr-automation)。
