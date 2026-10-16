# 用 Copilot 自动生成中文 Release Notes

使用 GitHub Agentic Workflows，在正式主／次版本发布后生成中文摘要，并保留原有 changelog。补丁版按需手动指定 tag 补生成。此方案使用 Actions 自带的 `GITHUB_TOKEN`，无需创建 PAT 或配置模型 API key。

## 认证与计费

[GitHub 官方文档](https://docs.github.com/en/copilot/concepts/agent-capabilities/agent-powered-workflows-and-operations/copilot-cli-in-github-actions) 明确区分两种 `GITHUB_TOKEN` 计费情况：个人仓库使用仓库所有者的 Copilot 席位额度；组织仓库直接向组织计费，需要组织管理员开启相应策略。因此 `YunYouJun/advjs` 使用 YunYouJun 的 Copilot 额度，手动触发者的身份不会改变额度归属。

关键配置是：

```yaml
permissions:
  contents: read
  pull-requests: read
  copilot-requests: write
engine: copilot
model: auto
```

[gh-aw 认证说明](https://github.github.com/gh-aw/reference/auth/) 介绍了 `copilot-requests: write` 的内置认证方式。编译后 Copilot 的 `COPILOT_GITHUB_TOKEN` 环境变量直接引用 `github.token`；这个环境变量名并不代表需要新建同名 secret。

这不是独立的公共免费 AI API。所有者必须有可用 Copilot 额度及模型访问权限，Actions 计算时间也按仓库现有规则计费。模板使用 `max-ai-credits: 50` 和运行超时控制成本，但这不能替代 Copilot 账单中的预算设置，也不应作为账单硬上限。

## 下载并编译模板

模板位于仓库的 [examples/copilot-release-notes](https://github.com/YunYouJun/ai/tree/main/examples/copilot-release-notes)，包含两个文件：

| 文件                                    | 职责                                          |
| --------------------------------------- | --------------------------------------------- |
| `.github/workflows/release-notes-zh.md` | 事件、权限、提示词、只读分析和发布 job        |
| `scripts/release/release-notes.mjs`     | 版本筛选、确定 Git 范围、保留原正文、定向写入 |

把模板目录的内容复制到目标仓库根目录，按项目读者调整提示词中的受众说明。模板不放在本仓库的 `.github/workflows` 下，不会对 `YunYouJun/ai` 启用自动发版说明。

在目标仓库中使用 GitHub CLI 和固定版本的 gh-aw 编译：

```bash
gh extension install github/gh-aw --pin v0.92.0
gh aw compile release-notes-zh --validate
```

已经安装其他 gh-aw 版本时，先核对版本再编译，升级时重新验证生成结果。提交源 Markdown、生成的 `.lock.yml`、`.github/aw/actions-lock.json` 和 `.gitattributes`，然后合并到默认分支。GitHub 执行 `.lock.yml`，修改 Markdown 后必须重新编译。

完整工作流源码：

<<< ../../examples/copilot-release-notes/.github/workflows/release-notes-zh.md

## 版本筛选与原文保留

| 入口                 | 规则                                             |
| -------------------- | ------------------------------------------------ |
| `release: published` | 自动运行，正式版本且 patch 为 0，排除 `0.0.0`    |
| `workflow_call`      | 默认 `automatic=true`，供已有发版流程直接调用    |
| `workflow_dispatch`  | 必填 tag，默认允许补丁版；可选择预览和强制重生成 |

支持 `v1.2.0`、`core-v1.2.0`、`desktop-v1.2.0`。其他命名需要先调整 `parseReleaseTag` 和对应测试。预发布 tag、GitHub prerelease 和草稿不自动总结。筛选在 pre-activation 阶段完成，跳过时不调用模型。

默认起点是同一 tag 系列下、目标提交的祖先中版本最高的较早正式 tag。可用 `from_tag` 指定起点，但必须为同系列、较早且为目标祖先的版本。没有起点时分析目标提交可达历史。所有范围绑定完整提交 SHA，不使用当前默认分支 HEAD 代替历史版本。

模型只提交 `notes`，不能指定 Release、原正文或 Git 范围。发布脚本重新读取目标 Release，添加 `ai-notes-zh:start/end` 区块，区块外的原文保持不变，PATCH 请求只包含 `body`。不会修改仓库内的 `CHANGELOG.md`、不可变发版清单或 Release 附件。

已有完整区块默认跳过，`force=true` 只替换该区块。标记损坏或重复时失败，避免误覆盖。按 tag 串行执行、发布前复读和幂等检查共同防止重复添加。

## 从现有发布流程直接调用

[GitHub Actions 事件规则](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow) 规定，`GITHUB_TOKEN` 引发的大多数事件不会启动新的工作流。如果已有流程通过它创建 Release，不能只依赖 `release: published`。

在现有发布 job 成功后调用同仓库的可复用工作流。下面的 `tag` 必须替换为发布 job 导出的目标 tag，`needs` 必须指向实际完成发布的 job：

```yaml
jobs:
  release-notes:
    needs: publish
    uses: ./.github/workflows/release-notes-zh.lock.yml
    permissions:
      actions: read
      contents: write
      pull-requests: read
      copilot-requests: write
    with:
      tag: ${{ needs.publish.outputs.tag }}
      automatic: true
```

这是需要接入既有 `publish` job 的片段，不是独立可执行的发布工作流。直接调用和事件触发同时发生时，同一 tag 的串行执行及已生成检查会避免重复发布。

ADV.JS 的实现接在发布事务和桌面附件上传成功之后。仅 npm 发包、推送 tag 或 dry-run 发版都不会新增摘要。实际项目入口见 [ADV.JS 发版工作流](https://github.com/YunYouJun/advjs/blob/dev/.github/workflows/release.yml) 和[维护指南](https://github.com/YunYouJun/advjs/blob/dev/docs/contributing/release-notes.md)。

## 手动补生成与预览

以下命令用于 ADV.JS；其他项目替换仓库、默认分支和 tag。首次验证使用已有 tag 的预览，不必创建测试 Release：

```bash
gh workflow run release-notes-zh.lock.yml -R YunYouJun/advjs --ref dev \
  -f tag=core-v0.1.2 -f dry_run=true
```

正式写入要求对应 GitHub Release 已发布。补丁版补生成和重生成已有区块分别使用：

```bash
gh workflow run release-notes-zh.lock.yml -R YunYouJun/advjs --ref dev \
  -f tag=v0.4.1

gh workflow run release-notes-zh.lock.yml -R YunYouJun/advjs --ref dev \
  -f tag=v0.4.1 -f from_tag=v0.4.0 -f force=true
```

选择包含最新脚本的默认分支运行。预检查和发布 job 使用 `github.workflow_sha` 检出脚本，所以补生成旧 tag 时不会因为旧代码缺少脚本而失败。

## 验证与排查

编译通过只能证明静态配置有效。还需要云端预览确认仓库的 Copilot 额度、权限和模型访问可用，再检查 Summary 与 `release-notes-zh-<run_id>` artifact。正式发布后确认中文摘要、原文和附件。

| 现象                   | 检查方向                                                        |
| ---------------------- | --------------------------------------------------------------- |
| Copilot 认证或额度错误 | `copilot-requests: write`、调用方权限上限、所有者额度／组织策略 |
| 发布了但没有运行       | 是否由 `GITHUB_TOKEN` 创建 Release，是否已接入 `workflow_call`  |
| 补丁版自动运行被跳过   | 符合设计，使用手动入口且保持 `automatic=false`                  |
| 缺少 GitHub Release    | 先完成实际发布，或以 `dry_run=true` 预览已有 tag                |
| 已有中文区块而跳过     | 需要重生成时手动传 `force=true`                                 |
| 发布 job 没有写入      | 检查模型是否提交输出、威胁检测是否通过、正文标记是否有效        |

ADV.JS 的本地回归覆盖版本边界、真实 Git 历史、原文保留、重复调用和写入范围；模板源自同一实现。静态检查和云端认证是不同层级的证据，不应将编译成功记作真实 Release 已更新。

## 已验证实例

2026-10-16 在个人仓库 `YunYouJun/advjs` 完成验证，集成见 [PR #70](https://github.com/YunYouJun/advjs/pull/70)：

- [手动补丁版预览运行](https://github.com/YunYouJun/advjs/actions/runs/38850664781)：`core-v0.1.2`、`dry_run=true`；使用 `GITHUB_TOKEN` 的 Copilot agent、检测和预览发布 job 全部成功，生成了中文说明 artifact。
- [自动补丁版跳过运行](https://github.com/YunYouJun/advjs/actions/runs/38850942124)：同一 tag、`automatic=true`；只执行预检查，agent、检测和发布 job 全部跳过。
- gh-aw v0.92.0 编译验证、49 项发版相关回归、ADV.JS 文档检查与构建通过；本仓库的 18 项测试、类型检查、lint 和文档构建通过。

验证入口在临时分支上借用已有 CI 文件，以绕过新工作流必须先进入默认分支才能直接 dispatch 的限制；模板本身保持不变。验证时仓库没有 GitHub Release，未创建测试 Release 或执行真实正文 PATCH。原 changelog 保留由回归测试覆盖。更多范围和环境信息见 [ADV.JS 验证记录](https://github.com/YunYouJun/advjs/blob/dev/docs/reports/2026-10-16-copilot-release-notes.md)。
