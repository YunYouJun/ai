# Claude Code FAQ

## 使用 `!` 直接执行 Bash 命令

在交互模式中，输入 `!` 前缀可以**直接运行 Bash 命令**，无需通过 Claude 解释或批准：

```bash
! npm test
! git status
! ls -la
```

主要特性：

- **上下文集成**：命令及其输出会自动添加到对话上下文中，Claude 可以基于执行结果继续对话
- **实时反馈**：显示实时的命令进度和输出
- **后台运行**：支持 `Ctrl+B` 将长时间运行的命令移至后台（Tmux 用户需按两次）
- **历史补全**：输入部分命令后按 `Tab`，可从当前项目历史 `!` 命令中自动补全

> 参考：[交互模式 - Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code/interactive-mode)

## 常用快捷命令

| 命令                                   | 作用                                       |
| -------------------------------------- | ------------------------------------------ |
| `!<command>`                           | 直接执行 Bash 命令，输出纳入对话上下文     |
| `#`                                    | 将内容写入 `CLAUDE.md` 记忆文件            |
| `/clear`                               | 清除当前对话上下文                         |
| `/permissions`                         | 管理工具权限白名单                         |
| `/plugin`                              | 打开插件管理器（发现、已安装、市场、错误） |
| `/plugin marketplace add <owner/repo>` | 添加一个 Plugin Marketplace                |
| `/plugin marketplace update <name>`    | 刷新指定 marketplace 的插件列表            |
| `/plugin install <name>@<marketplace>` | 从指定 marketplace 安装插件                |

例如 `/plugin marketplace update yunyoujun` 会从 `yunyoujun` 这个已注册的 marketplace 源拉取最新的插件列表，确保本地缓存与远程仓库同步。

> 参考：[Plugin Marketplaces - Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code/plugin-marketplaces)
