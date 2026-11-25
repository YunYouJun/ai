# 清理已合并分支

`git-branch-cleanup` 用于 PR 合并后的 Git 收尾。它先核对合入证据、远端分支和工作树占用，获得清理授权后再删除指定范围内的分支。

## 安装

```bash
npx skills add YunYouJun/ai --skill=git-branch-cleanup
```

## 用法

在目标仓库调用 `/git-branch-cleanup`，或在 Codex 中用 `$git-branch-cleanup`。

- 「检查哪些分支已经合入 `main`」只做核对。
- 「清理已合入 `main` 的本地分支」只清理本地。
- 「确认 `feature/example` 已合并后清理本地和远端副本」会分别核对两端。

普通合并可以用 Git 的祖先关系验证。squash 或 rebase 会改写提交，Skill 会结合 PR 记录和实际改动核对。工作树占用、独有改动或证据不足的分支会保留。

[任务收尾](./wrap-up)处理提交和会话归档。分支清理适合在合并完成后单独运行。

::: details SKILL.md

<<< @/../skills/git-branch-cleanup/SKILL.md

:::
