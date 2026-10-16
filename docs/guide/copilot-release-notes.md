# 用 Copilot 自动生成双语 Release Notes

使用 GitHub Agentic Workflows，在正式主／次版本发布后生成中英文摘要，并保留原有 changelog。补丁版按需手动指定 tag 和语言补生成。此方案使用 Actions 自带的 `GITHUB_TOKEN`，无需创建 PAT 或配置模型 API key。

## 认证与计费

### 引用者消耗谁的 Copilot 额度？

**其他人在自己的仓库引用本工作流，消耗该仓库所有者或所属组织的 Copilot 额度，不消耗模板作者 YunYouJun 的额度。** “调用方”指安装接入 YAML、实际运行 Actions 的仓库，并非手动点击 Run workflow 的用户。

根据 [GitHub 的 Copilot CLI 认证与计费规则](https://docs.github.com/en/copilot/concepts/agent-capabilities/agent-powered-workflows-and-operations/copilot-cli-in-github-actions#authentication-and-billing-options)，使用内置 `GITHUB_TOKEN` 时，额度归属如下：

| 实际运行的调用方仓库        | Copilot 额度／费用归属             | 手动触发者或模板作者是否影响归属      |
| --------------------------- | ---------------------------------- | ------------------------------------- |
| `alice/project`（个人仓库） | 所有者 `alice` 的 Copilot 席位     | 否；即使由其他协作者点击运行          |
| `acme/project`（组织仓库）  | `acme` 组织                        | 否；不按触发者的个人席位扣减          |
| `YunYouJun/advjs`           | 所有者 `YunYouJun` 的 Copilot 席位 | 否；其他人触发仍使用 YunYouJun 的额度 |

组织管理员需启用 Copilot CLI 及 “Allow use of Copilot CLI billed to the organization” 策略。组织直接计费不受成员个人 Copilot 预算限制，应在组织账单中管理预算和查看用量。个人仓库所有者则需要可用的 Copilot 席位额度和模型访问权限。上述规则核对于 2026-10-16，最终消费与费用以相应个人／组织的 GitHub 账单为准。

这也适用于跨仓库和多层复用：[GitHub reusable workflow 的 `github` 上下文始终属于调用方](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations#github-context)，其中的 `github.token` 和 `secrets.GITHUB_TOKEN` 都来自调用方。`uses: YunYouJun/ai/...` 只引用工作流代码，不共享 ai 仓库的凭据或 Copilot 订阅；[GitHub 托管 runner 的计费也归调用方](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations#how-reusable-workflows-use-runners)。

### Copilot Free 能用吗？

**可以，不要求付费 Copilot 订阅。** [GitHub 2026-06-11 官方公告](https://github.blog/changelog/2026-06-11-agentic-workflows-no-longer-need-a-personal-access-token/) 明确说明，使用 `GITHUB_TOKEN` 的 Agentic Workflows 支持所有 Copilot 套餐，包括 Copilot Free。结合上述个人仓库计费规则，仓库所有者可以使用自己的 Free 额度，无需 PAT。

接入条件和限制如下：

- 个人仓库所有者需已[开通 Copilot Free](https://docs.github.com/en/copilot/get-started/plans)，并有可用额度。仅有免费的 GitHub 账号、公开仓库或 `GITHUB_TOKEN`，不会自动获得无限 AI 推理能力。
- [当前套餐说明](https://docs.github.com/en/copilot/get-started/plans#models)规定，Copilot Free 只支持自动选模。本工作流已使用 `model: auto`，编译后的分析和威胁检测 job 均使用 `COPILOT_MODEL: auto`，无需在接入 YAML 中另加模型配置。
- [Copilot Free 包含有限的 AI credits](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing#github-ai-credits-allowance-by-plan)，可用量以账户用量页面为准，不保证每月可生成固定数量的 Release Notes。长历史分析、双语输出和威胁检测会增加消费；`dry_run` 预览也会消费额度。额度耗尽时，需按 GitHub 提供的方案等待重置或增加可用额度，`copilot-requests: write` 不会绕过套餐限制。
- 组织仓库仍按组织的 Copilot 策略和可用预算运行；触发者拥有 Copilot Free，不会让组织工作流改为消耗其个人免费额度。

以上是截至 2026-10-16 的**官方支持范围与当前配置核对结果**，并非独立 Free 账号的端到端实测。本文已有云端运行记录未覆盖独立 Copilot Free 账号；首次接入仍应在目标仓库用已有 tag 执行 `dry_run` 预览，确认该账户的授权、额度和模型访问正常。预检查跳过或 CI 编译通过，不能证明 Free 账号已成功调用模型。

### 无需 PAT 的认证方式

关键配置是：

```yaml
permissions:
  contents: read
  pull-requests: read
  copilot-requests: write
engine: copilot
model: auto
```

[gh-aw 认证说明](https://github.github.com/gh-aw/reference/auth/) 介绍了 `copilot-requests: write` 的内置认证方式。本工作流编译后的分析和威胁检测 job 都将 `COPILOT_GITHUB_TOKEN` 环境变量直接设为调用方的 `github.token`；这个环境变量名并不代表需要新建同名 secret。接入 YAML 无需传递 PAT、API key 或 `secrets: inherit`，也不会读取模板作者的个人凭据。调用方缺少额度、模型访问权限或组织策略时，Copilot 请求会失败，不会转用 YunYouJun 的额度。

这不是独立的公共免费 AI API。Copilot 推理与 Actions 计算时间分别按调用方的现有规则计费；公开模板不意味着推理免费。`dry_run=true` 只阻止修改 Release，实际生成预览仍会消耗 Copilot 额度和 Actions 资源；版本筛选或已有摘要检查在模型调用前跳过时，不产生本次 Copilot 推理消费。模板使用 `max-ai-credits: 50` 和运行超时控制成本，但这不能替代 Copilot 账单中的预算设置，也不应作为账单硬上限。

## 跨仓库直接接入

在目标仓库创建 `.github/workflows/release-notes.yml`，合并到默认分支。下面的 15 行同时支持正式主／次版本自动生成，以及手动输入 tag 补生成：

<<< ../../examples/copilot-release-notes/.github/workflows/release-notes.yml

调用方只声明一个 `tag`，不需要 `with`、语言、布尔开关或第二套 `workflow_call.inputs`。在 Actions → Run workflow 输入目标 tag，或运行：

```bash
gh workflow run release-notes.yml -R OWNER/REPO -f tag=v1.2.3
```

[GitHub 的手动输入表单](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_dispatchinputs) 来自调用方的 `workflow_dispatch.inputs`，不能从远端 `workflow_call` 继承表单。`tag` 的这一处声明仍需留在调用方；转发、默认值和事件判断都由 ai 的 `release-notes.yml` 入口集中处理：Release 事件自动筛选主／次版本，手动事件允许补丁版；默认补齐中英文。

只需自动生成时，也可保留原来的 [14 行示例](https://github.com/YunYouJun/ai/blob/main/examples/copilot-release-notes/.github/workflows/release-notes-minimal.yml)。两种入口均支持 `1.2.0`、`v1.2.0`、`core-v1.2.0`、`desktop-v1.2.0`，不同前缀各自比较。

`release-notes-v1` 是兼容版本标签。生产环境可将标签换成完整提交 SHA。调用方不需要安装 gh-aw、复制脚本或配置 `secrets: inherit`。

### 高级选项只增加一个字段

需要预览、指定语言或重新生成时，增加一个可选 `options` 字符串即可，无须逐项复制输入定义：

<<< ../../examples/copilot-release-notes/.github/workflows/release-notes-options.yml

```bash
gh workflow run release-notes.yml -R OWNER/REPO -f tag=v1.2.3 \
  -f options='{"language":"en","dry_run":true}'
```

| JSON 字段  | 默认值   | 用途                                 |
| ---------- | -------- | ------------------------------------ |
| `from_tag` | 自动确定 | 同前缀、较早且属于目标祖先的比较起点 |
| `language` | `both`   | `both`、`zh-CN`、`en`                |
| `force`    | `false`  | 重写所选语言，保留其他语言和原文     |
| `dry_run`  | `false`  | 只上传预览，不修改 Release           |

`options` 必须是 JSON 对象，布尔值使用 `true` / `false`，不能用字符串。未知字段、无效类型或语言会在调用模型前报错；`tag` 和自动筛选模式不能通过 JSON 覆盖。JSON 字段优先于对应的 typed API 参数；`dry_run` 采用 true 优先，不能关闭已由显式参数或 staged 模式启用的预览保护。

工作流运行在调用方仓库，使用调用方的 `GITHUB_TOKEN` 和 Actions 资源；Copilot 额度归属调用方仓库所有者或所属组织，详见[认证与计费](#认证与计费)。`actions: read` 供 gh-aw 确认所引用工作流版本；分析 job 仅有只读仓库权限和 Copilot 请求权限，只有检测通过后的发布 job 获得 `contents: write`。

GitHub Actions 必须允许调用公共仓库的 reusable workflow 和其中使用的 actions。个人仓库仍需所有者有可用 Copilot 额度，组织仓库遵循组织策略；接入不会绕过这些前提。

## 集中维护与版本固定

源码位于 [release-notes.md](https://github.com/YunYouJun/ai/blob/main/.github/workflows/release-notes.md)，事件入口 `release-notes.yml` 将调用方事件转发给编译后的 `release-notes.lock.yml`。后者保留独立的 typed `workflow_call` API，供发版 job 通过 `with` 传参。版本筛选和发布脚本位于 [scripts/release-notes.mjs](https://github.com/YunYouJun/ai/blob/main/scripts/release-notes.mjs)。

预检查分别检出 ai 的实现和调用方完整历史。实现检出使用 GitHub 的 `job.workflow_repository` 与 `job.workflow_sha`，固定到 `uses` 实际解析的提交；字段缺失则失败，不回退到 `main`。Copilot 只分析调用方仓库，发布 job 只执行同一 ai 提交中的脚本。调用方的 Release tag 不能替换发布脚本。

维护者在 ai 仓库修改源码后编译并提交生成文件；接入方无须执行：

```bash
gh extension install github/gh-aw --pin v0.92.0
gh aw compile release-notes --no-check-update --validate
pnpm vitest run
```

源码、`.lock.yml`、`.github/aw/actions-lock.json` 和 `.gitattributes` 一并提交。CI 检查重新编译无差异，并运行回归测试、lint、类型检查和文档构建。兼容修复可以更新 v1 标签；不兼容的输入、权限或 tag 规则变更应发布新的主版本。GitHub Enterprise Server 不提供所需的 `job.workflow_*` 字段，目前仅支持 GitHub.com。

## 语言选择与阅读方式

默认 `language=both`，共用一次 Git 变更分析生成简体中文和英文。两版保持分类、事实和引用对应；已有另一语言时，先核对 Git 范围，再用现有摘要作为翻译对照。每种新摘要必须提供可点击的 GitHub PR/commit 链接，同时生成两种语言时，脚本会验证引用 URL 集合一致；语义正确性仍需审阅。导航和折叠不会调用 AI。

| `language` | 行为                                       |
| ---------- | ------------------------------------------ |
| `both`     | 默认只补缺失的语言；中英文均存在则跳过模型 |
| `zh-CN`    | 只生成中文，保留英文                       |
| `en`       | 只生成英文，保留中文                       |

`force=true` 只重写所选语言。旧版中文标记兼容：补英文会升级为双语布局，已有中文区块保持原样。

GitHub Release 使用“简体中文 · English · 完整变更记录”导航和原生 `<details>` 分区。中文默认展开，英文和完整 changelog 默认折叠；只有英文时，英文默认展开。先展示摘要，再按需阅读完整记录，不保存个人语言偏好。参见 [GitHub 折叠区块说明](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections)。保留原工作流文件名 `release-notes-zh.lock.yml`，兼容既有调用；Actions 显示名为“AI Release Notes”。

目标使用 `<a name="ai-release-notes-zh"></a>` 形式的命名锚点，放在折叠分区内容内，导航链接包含 GitHub 渲染后的 `user-content-` 前缀。这样点击 English 或完整变更记录时，会展开目标并定位。PR 正文预览不能替代真实 Release 页检查，应同时确认默认状态、目标可见性和实际滚动位置。

## 版本筛选与原文保留

预检查与 Copilot 分析是不同 job。`on.steps` 中的 `fetch-depth: 0` 只作用于预检查；分析 job 还需要单独配置完整历史，否则补生成旧 tag 时会出现 `fatal: bad object`：

```yaml
checkout:
  fetch-depth: 0
```

这是 [gh-aw 的分析 job 检出配置](https://github.github.com/gh-aw/reference/checkout/)。提示词优先使用本地 Git 证据，GitHub MCP 只补充 PR 信息；完整性过滤可能隐藏 API 返回的历史提交，不能只依赖 MCP。无需关闭该过滤。首次发布没有较早 tag，起点 SHA 为空属于正常情况。

| 入口                 | 规则                                                      |
| -------------------- | --------------------------------------------------------- |
| `release: published` | 自动运行，正式版本且 patch 为 0，排除 `0.0.0`             |
| `workflow_call`      | `.lock.yml` API 默认 `automatic=true`，供发版流程直接调用 |
| `workflow_dispatch`  | 必填 tag，默认允许补丁版；可选择预览和强制重生成          |

支持 `v1.2.0`、`core-v1.2.0`、`desktop-v1.2.0`。其他命名需要先调整 `parseReleaseTag` 和对应测试。预发布 tag、GitHub prerelease 和草稿不自动总结。筛选在 pre-activation 阶段完成，跳过时不调用模型。

默认起点是同一 tag 系列下、目标提交的祖先中版本最高的较早正式 tag。可用 `from_tag` 指定起点，但必须为同系列、较早且为目标祖先的版本。没有起点时分析目标提交可达历史。所有范围绑定完整提交 SHA，不使用当前默认分支 HEAD 代替历史版本。

模型只提交本次请求的 `notes_zh`、`notes_en`，不能指定 Release、原正文或 Git 范围。脚本要求请求的语言完整，拒绝额外语言和模型提供的管理标记、折叠布局。发布前重新读取目标 Release，用 `ai-release-notes:start/end` 管理摘要布局，每种语言另有 `ai-notes-zh:start/end`、`ai-notes-en:start/end` 标记；完整原文放入 `ai-changelog:start/end` 的折叠容器。未选中语言区块和 changelog 原文按字节保留，PATCH 请求只包含 `body`。不会修改仓库内的 `CHANGELOG.md`、不可变发版清单或 Release 附件。

所选语言均有完整区块时默认跳过，`force=true` 只重写所选语言。标记损坏或重复时失败，避免误覆盖。按 tag 串行执行、发布前复读和幂等检查共同防止重复添加。

已有 Release 只升级展示方式时，使用 `layout` 入口，不重新调用模型。在已提供 `GH_TOKEN` 或 `GITHUB_TOKEN` 的环境中运行；Actions 可用 `github.token`，更新正文需要 `contents: write`：

```bash
GITHUB_REPOSITORY=OWNER/REPO \
RELEASE_NOTES_TAG=v1.2.3 \
RELEASE_NOTES_DRY_RUN=true \
node scripts/release-notes.mjs layout
```

确认 `release-notes-preview.md` 后，将 `RELEASE_NOTES_DRY_RUN` 改为 `false` 写入。命令保留已有摘要和原 changelog，重复执行返回 `unchanged`，不嵌套折叠；没有 AI 摘要的普通 Release 不会被强制改写。

## 从现有发布流程直接调用

[GitHub Actions 事件规则](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow) 规定，`GITHUB_TOKEN` 引发的大多数事件不会启动新的工作流。如果已有流程通过它创建 Release，不能只依赖 `release: published`。

在现有发布 job 成功后直接调用 ai 的可复用工作流。下面的 `tag` 必须替换为发布 job 导出的目标 tag，`needs` 必须指向实际完成发布的 job：

```yaml
jobs:
  release-notes:
    needs: publish
    uses: YunYouJun/ai/.github/workflows/release-notes.lock.yml@release-notes-v1
    permissions:
      actions: read
      contents: write
      pull-requests: read
      copilot-requests: write
    with:
      tag: ${{ needs.publish.outputs.tag }}
      automatic: true
```

此处直接调用 `.lock.yml` 的 typed API，保留现有参数，免于在调用方再声明 `workflow_call.inputs`。`options` JSON 也可通过 API 的同名字符串输入传入。

这是需要接入既有 `publish` job 的片段，不是独立可执行的发布工作流。直接调用和事件触发同时发生时，同一 tag 的串行执行及已生成检查会避免重复发布。

ADV.JS 的实现接在发布事务和桌面附件上传成功之后。仅 npm 发包、推送 tag 或 dry-run 发版都不会新增摘要。实际项目入口见 [ADV.JS 发版工作流](https://github.com/YunYouJun/advjs/blob/dev/.github/workflows/release.yml) 和[维护指南](https://github.com/YunYouJun/advjs/blob/dev/docs/contributing/release-notes.md)。

## 手动补生成与预览

以下命令用于 ADV.JS；其他项目替换仓库、默认分支和 tag。首次验证使用已有 tag 的预览，不必创建测试 Release：

```bash
gh workflow run release-notes-zh.lock.yml -R YunYouJun/advjs --ref dev \
  -f tag=core-v0.1.2 -f options='{"dry_run":true}'
```

正式写入要求对应 GitHub Release 已发布。补丁版补齐中英文，和只重写英文分别使用：

```bash
gh workflow run release-notes-zh.lock.yml -R YunYouJun/advjs --ref dev \
  -f tag=v0.4.1

gh workflow run release-notes-zh.lock.yml -R YunYouJun/advjs --ref dev \
  -f tag=v0.4.1 -f options='{"from_tag":"v0.4.0","language":"en","force":true}'
```

选择包含最新脚本的默认分支运行。预检查和发布 job 使用 `job.workflow_sha` 检出 ai 中的脚本，所以补生成旧 tag 时不会因为旧代码缺少脚本而失败。

## 验证与排查

编译通过只能证明静态配置有效。还需要云端预览确认仓库的 Copilot 额度、权限和模型访问可用，再检查 Summary 与 `release-notes-<run_id>` artifact 中的 `release-notes-preview.md`。正式发布后确认两种语言内容对应、导航与折叠正常、原文和附件完整。

| 现象                   | 检查方向                                                        |
| ---------------------- | --------------------------------------------------------------- |
| Copilot 认证或额度错误 | `copilot-requests: write`、调用方权限上限、所有者额度／组织策略 |
| 发布了但没有运行       | 是否由 `GITHUB_TOKEN` 创建 Release，是否已接入 `workflow_call`  |
| 补丁版自动运行被跳过   | 符合设计，使用手动入口且保持 `automatic=false`                  |
| 缺少 GitHub Release    | 先完成实际发布，或以 `dry_run=true` 预览已有 tag                |
| 所选语言已存在而跳过   | 需要重生成时选择语言并传 `force=true`；补另一语言不需要 force   |
| 发布 job 没有写入      | 检查模型是否提交输出、威胁检测是否通过、正文标记是否有效        |

ai 的集中回归覆盖版本边界、真实 Git 历史、单双语选择、旧中文区块升级、JSON 选项、原文保留、幂等和定向写入；ADV.JS 检查事件入口与发布事务。静态检查和云端认证是不同层级的证据，不应将编译成功记作真实 Release 已更新。

## 已验证实例

双语实现见 [ADV.JS PR #72](https://github.com/YunYouJun/advjs/pull/72) 与 [本仓库 PR #4](https://github.com/YunYouJun/ai/pull/4)。[最终双语预览](https://github.com/YunYouJun/advjs/actions/runs/38866967520)全部成功，产物的中英文分类对应，六个相同 commit URL 均属于目标历史。62 项发版回归、CLI 与本地 HTTP 模拟、GitHub 渲染和页面折叠验证通过；详细环境和产物校验值见[验证记录](./copilot-release-notes-validation#双语设计与验证)。ADV.JS PR #72 已合并到默认分支 `dev`，启用状态和合并后运行证据见[默认分支复验](./copilot-release-notes-validation#双语工作流默认分支复验)。

以下为 2026-10-16 初版中文验证的历史记录，集成见 [PR #70](https://github.com/YunYouJun/advjs/pull/70)：

- [手动补丁版预览运行](https://github.com/YunYouJun/advjs/actions/runs/38850664781)：`core-v0.1.2`、`dry_run=true`；使用 `GITHUB_TOKEN` 的 Copilot agent、检测和预览发布 job 全部成功，生成了中文说明 artifact。
- [自动补丁版跳过运行](https://github.com/YunYouJun/advjs/actions/runs/38850942124)：同一 tag、`automatic=true`；只执行预检查，agent、检测和发布 job 全部跳过。
- gh-aw v0.92.0 编译验证、49 项发版相关回归、ADV.JS 文档检查与构建通过；本仓库的 18 项测试、类型检查、lint 和文档构建通过。

验证入口在临时分支上借用已有 CI 文件，以绕过新工作流必须先进入默认分支才能直接 dispatch 的限制；模板本身保持不变。验证时仓库没有 GitHub Release，未创建测试 Release 或执行真实正文 PATCH。原 changelog 保留由回归测试覆盖。更多范围和环境信息见 [云端验证记录](./copilot-release-notes-validation)。
