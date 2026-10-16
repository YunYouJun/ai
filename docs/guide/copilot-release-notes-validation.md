# Copilot 中文 Release Notes 验证记录

日期：2026-10-16。首次本地检查和临时分支预览通过后，ADV.JS PR #70 与 AI PR #2 已合并；正式入口复验发现分析 job 的浅克隆遗漏，修复和回归见下节。全程未创建测试 Release。

## 验证对象

实现提交：[2dff2b75](https://github.com/YunYouJun/advjs/commit/2dff2b75)。工作流使用 gh-aw v0.92.0 编译，Copilot CLI 版本由编译器锁定为 1.0.96，`copilot-requests: write` 提供内置 `GITHUB_TOKEN` 认证。未新增 PAT、模型 API key 或 Actions secret。

由于新工作流尚未出现在默认分支，GitHub API 不能直接按文件名 dispatch。在临时验证分支中，仅将已有 `ci.yml` 改为调用同一份 `release-notes-zh.lock.yml`；该验证入口不进入集成 PR，也不运行发布事务。

## 云端结果

| 场景           | 结果与证据                                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 手动补丁版预览 | [运行 38850664781](https://github.com/YunYouJun/advjs/actions/runs/38850664781)，成功                                                                                  |
| 预览参数       | `tag=core-v0.1.2`、`dry_run=true`、`automatic=false`                                                                                                                   |
| 解析范围       | 目标 `8a62e9be8444496eaa4f0e7e1d9fa3bba95a1dd0`；同系列无较早 tag，比较起点为空                                                                                        |
| 实际执行       | pre-activation、activation、Copilot agent、检测、publish_release_notes、conclusion 全部成功                                                                            |
| 生成内容       | `release-notes-zh-38850664781` artifact 内的 `release-notes-zh-preview.md`；中文摘要与管理区块已生成，核验其 commit 链接均属于目标历史                                 |
| 自动补丁版筛选 | [运行 38850942124](https://github.com/YunYouJun/advjs/actions/runs/38850942124)，成功；同一 tag、`automatic=true`，pre-activation 通过，agent、检测和发布 job 全部跳过 |

预览文件 SHA-256：`4c7ab46ef6cb2223a6726a4204ed686ca8bb75e23302d25213d38923ce9d8431`。摘要 artifact 默认保留 14 天；运行日志按仓库 Actions 保留策略保存。

验证时仓库尚无 GitHub Release。预览没有创建 Release，也未执行真实正文 PATCH。正式主／次版本自动筛选、原文保留、仅修改 `body` 和重复运行行为由下列回归测试覆盖；首次正式发布仍需检查页面最终呈现。

## 本地检查

- `gh aw compile release-notes-zh --validate`：通过，0 warnings；使用固定的 v0.92.0 原生二进制。
- 四个发版测试文件合计 49 项：通过，覆盖真实 Git 历史、版本边界、预检查、幂等、管理区块替换及定向 API 更新。
- 改动文件 ESLint、`git diff --check`：通过。
- `pnpm docs:check`：通过，48 个文件。
- `pnpm docs:build`：通过；TypeDoc 有既有标签告警，0 errors。
- actionlint v1.7.12：其尚不支持 `copilot-requests`、`concurrency.queue` 和 gh-aw 生成的 `job.workflow_*` 字段；仅排除这三类诊断后通过，GitHub 云端也已接受并运行相同工作流。

gh-aw 的 Docker 扫描器未运行，本记录不将编译成功等同于容器扫描通过。

## 合并后复验与历史检出修复

默认分支的[自动补丁版筛选](https://github.com/YunYouJun/advjs/actions/runs/38859130945)成功；[首次手动预览](https://github.com/YunYouJun/advjs/actions/runs/38859142602)失败，未发布摘要。代理先尝试本地 Git，得到目标提交 `fatal: bad object`，随后 GitHub MCP 的历史提交响应被完整性策略全部过滤，因而报告 `missing_data`。目标 SHA 已正确传入；首次发布的空起点不属于缺失数据。

原因是预检查和分析 job 使用不同的 checkout。初版只为预检查配置完整历史，分析 job 仍使用默认浅克隆。模板现已补上顶层 `checkout.fetch-depth: 0`，并明确优先读取本地 Git；原有 MCP 完整性过滤保留。

新增回归测试从实际编译的分析 job 读取 checkout 深度，以真实 Git 仓库复现历史提交读取：修复前连续出现 `bad object`，修复后通过。发版相关测试总数由 49 增至 50。修复后的云端运行可在 [ADV.JS 中文 Release Notes 工作流](https://github.com/YunYouJun/advjs/actions/workflows/release-notes-zh.lock.yml)查看；需要同时确认整体成功和预览 artifact，不能只看 agent job 成功。

## 运维入口

日常操作、补生成、强制替换及额度说明见[ADV.JS 中文 Release Notes](https://github.com/YunYouJun/advjs/blob/dev/docs/contributing/release-notes.md)。复用模板和个人／组织计费差异记录在 [复用指南](./copilot-release-notes)。
