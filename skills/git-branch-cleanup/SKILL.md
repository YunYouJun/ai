---
name: git-branch-cleanup
description: 检查和清理已合并的 Git 分支，核实普通合并、squash 与 rebase，保护工作树和独有改动。
---

# 清理已合并分支

默认只核对。用户授权清理时，只删除指定范围内且有合入证据的分支。

1. **收集状态**
   - 确认仓库、远端和目标分支；联网时用 `git fetch --prune <远端>` 刷新引用。
   - 用 `git status --short --branch`、`git branch -avv` 和 `git worktree list --porcelain` 核对本地与远端 SHA、上游映射和工作树占用。

2. **核验合入证据**
   - 普通合并：用 `git merge-base --is-ancestor <分支SHA> <目标SHA>` 核验祖先关系。
   - squash / rebase：有 PR 时核对已合并 PR 的目标分支、合并 SHA 与源提交，确认合并 SHA 在目标历史上且候选分支无额外改动；无 PR 或源 SHA 不一致时，核对目标合并点的实际文件内容，必要时用 `git range-diff` 追踪重放差异。
   - 同名、PR 标题或 `patch-id` 只能用于定位线索，不能单独作为删除证据。

3. **保护未就绪分支**
   - 保留默认分支、目标分支、有独有改动、证据不足，以及被工作树或开放 PR 使用的分支。
   - 核对所有已检出分支的上游远端分支，即使本地与远端不同名也不得误删。
   - 用户指定清理当前分支时，先确认工作树干净且可安全切到目标分支。

4. **按授权安全删除**
   - 删除前确认分支未更新且未被占用；有更新则重新核验。
   - 本地用 `git branch -d -- <分支>`；已证实合入的 squash / rebase 分支若仅因祖先检查被拒，可针对该分支使用 `-D`。
   - 远端在授权范围内时，用 `git ls-remote --heads <远端> refs/heads/<分支>` 取当前 SHA，再锁定该 SHA 删除：

     ```bash
     git push --force-with-lease=refs/heads/<分支>:<SHA> <远端> :refs/heads/<分支>
     ```

回读本地和远端引用，报告删除范围、原 SHA、合入证据和保留理由。
