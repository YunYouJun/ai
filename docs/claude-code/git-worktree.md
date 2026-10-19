# Git Worktree 并行处理

> 参考：[git-worktree 官方文档](https://git-scm.com/docs/git-worktree)

Git Worktree 允许在同一仓库的不同目录中检出多个分支，**共享同一个 `.git` 对象数据库**，既隔离工作目录又不浪费磁盘空间。这是 Claude Code 多实例并行开发的最佳搭档。

## 为什么用 Worktree 而不是多次 Clone？

| 对比项   | `git clone`（多次）         | `git worktree add`       |
| -------- | --------------------------- | ------------------------ |
| 磁盘占用 | 每个 clone 一份完整 `.git`  | 所有 worktree 共享同一份 |
| 创建速度 | 需要网络拉取                | 本地瞬间完成             |
| 分支同步 | 各 clone 独立，需手动 fetch | 天然共享 refs，自动同步  |
| 适用场景 | 完全隔离的环境              | 同一项目的并行任务       |

## 核心命令速查

```bash
# 创建新 worktree 并检出已有分支
git worktree add ../my-project-hotfix hotfix/urgent-bug

# 创建新 worktree 并同时新建分支（最常用）
git worktree add -b feat/new-feature ../my-project-feat main

# 以分离 HEAD 方式创建（适合临时测试某个 commit）
git worktree add --detach ../my-project-test abc1234

# 列出所有 worktree
git worktree list

# 完成后移除 worktree（会清理目录和管理文件）
git worktree remove ../my-project-hotfix

# 清理手动删除的残留 worktree 信息
git worktree prune
```

### 常用选项

| 命令     | 选项                    | 说明                                  |
| -------- | ----------------------- | ------------------------------------- |
| `add`    | `-b <branch>`           | 创建并检出新分支                      |
| `add`    | `-B <branch>`           | 创建或重置分支                        |
| `add`    | `--detach`              | 分离 HEAD，不关联分支（适合临时测试） |
| `add`    | `--lock`                | 创建后立即锁定                        |
| `add`    | `--no-checkout`         | 不执行 checkout，用于自定义稀疏检出   |
| `list`   | `--porcelain`           | 机器可解析格式，适合脚本              |
| `remove` | `-f`                    | 强制移除（含未提交更改时）            |
| `lock`   | `--reason <msg>`        | 指定锁定原因                          |
| `move`   | `<worktree> <new-path>` | 移动 worktree 到新位置                |
| `repair` | `[<path>...]`           | 修复移动后断裂的链接                  |

::: tip 路径约定
建议将 worktree 放在主仓库的**同级目录**下，以项目名作为前缀。例如主仓库在 `~/repos/my-project`，worktree 放在 `~/repos/my-project-feat`、`~/repos/my-project-fix`。
:::

## Claude Code + Worktree 并行工作流

典型场景：同时进行一个新功能开发和一个紧急修复。

```bash
# 终端 1：主仓库 — 功能开发
cd ~/repos/my-project
claude
# > 在当前分支开发新功能...

# 终端 2：创建 worktree — 紧急修复
git worktree add -b fix/critical-bug ../my-project-fix main
cd ../my-project-fix
claude
# > 修复线上紧急 Bug 并创建 PR...

# 终端 3：创建 worktree — 代码审查
git worktree add ../my-project-review origin/feat/someone-pr
cd ../my-project-review
claude
# > 审查他人 PR，提出反馈...
```

每个终端中的 Claude 拥有**独立的工作目录和上下文**，互不干扰。

```
┌─────────────────────────────────────────────────┐
│              同一个 .git 仓库                     │
├───────────────┬───────────────┬─────────────────┤
│ my-project/   │ my-project-fix│ my-project-review│
│ (main)        │ (fix/bug)     │ (feat/pr-123)   │
│ Claude A      │ Claude B      │ Claude C        │
│ 功能开发       │ 紧急修复       │ 代码审查        │
└───────────────┴───────────────┴─────────────────┘
```

## 与无头模式结合：批量并行处理

将 Worktree + 无头模式（`-p`）组合，实现真正的并行自动化：

```bash
#!/bin/bash
# 并行处理多个 Issue
issues=(42 43 44 45)

for issue in "${issues[@]}"; do
  # 为每个 Issue 创建独立 worktree
  git worktree add -b "fix/issue-${issue}" "../project-fix-${issue}" main

  # 在后台启动 Claude 无头模式
  (
    cd "../project-fix-${issue}"
    claude -p "Fix issue #${issue}: fetch the issue with gh, implement the fix, run tests, commit and create a PR" --allowedTools bash,git,gh
  ) &
done

# 等待所有后台任务完成
wait
echo "All issues processed!"

# 清理所有 worktree
for issue in "${issues[@]}"; do
  git worktree remove "../project-fix-${issue}" 2>/dev/null
done
```

## 注意事项

::: warning 使用限制

- **同一分支不能同时被两个 worktree 检出**。创建 worktree 时请使用 `-b` 新建分支，或用 `--detach` 分离 HEAD
- **子模块支持不完整**。包含 submodule 的项目谨慎使用多 worktree
- 如果 worktree 目录被手动删除（非 `git worktree remove`），运行 `git worktree prune` 清理残留
- 使用 `git worktree lock` 保护位于外部设备上的 worktree，防止被 `git gc` 误清理
  :::

## 进阶配置

### 工作树独立配置

开启 `extensions.worktreeConfig` 可以为每个 worktree 独立设置配置项：

```bash
git config extensions.worktreeConfig true
git config --worktree core.sparseCheckout true
```

适用于不同 worktree 需要不同稀疏检出规则的场景。

### 跨 Worktree 引用访问

多个 worktree 共享 `refs/` 下的引用（分支、标签），但 `HEAD`、`refs/bisect` 等是独立的。可以通过特殊路径访问其他 worktree 的引用：

```bash
# 访问主 worktree 的 HEAD
git rev-parse main-worktree/HEAD

# 访问名为 my-feat 的 worktree 的 HEAD
git rev-parse worktrees/my-feat/HEAD
```

## 相关资源

- [多 Claude 工作流](/claude-code/best-practices#_6-多-claude-工作流升级) — 更多并行协作模式
- [PR 自动化实践](/practices/pr-automation) — 配合 Skills 自动化 PR 流程
- [git-worktree 官方文档](https://git-scm.com/docs/git-worktree)
