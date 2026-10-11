# Issue Autopilot：Valaxy 单仓试运行

目标是把「新 Issue → 分诊 → 可复现的小修复 → 验证与 review → Draft PR」串起来，先验证一次安全闭环。

**当前交付是 Skill、JSON 策略与运行模板，不是已部署的后台服务。** 默认 dry-run；没有启用 GitHub Actions、App、webhook、定时任务或新增付费服务。提示词与策略文件不等于运行时隔离，不能靠它们保证并发、锁、权限和预算。

## 入口与复用

- [triage-issues](https://github.com/YunYouJun/ai/tree/main/plugins/ai-coding/skills/triage-issues)：只读筛选和门禁
- [Valaxy 策略示例](https://github.com/YunYouJun/ai/blob/main/plugins/ai-coding/skills/triage-issues/assets/valaxy.policy.example.json)：精确限定 `YunYouJun/valaxy`（仓库 ID `467617659`）
- [任务记录模板](https://github.com/YunYouJun/ai/blob/main/plugins/ai-coding/skills/triage-issues/assets/task-record.example.json)：保存版本、授权、锁、预算与验证证据
- 修复和 review 继续复用 `fix-issue` → `pr-cycle` / `copilot-review-loop`，不另写一套修复器

```text
/ai-coding:triage-issues YunYouJun/valaxy
```

该调用只生成分诊结果。单次人工试运行可以用明确的维护者选择进入下一阶段，无需提前创建标签；一次选择不能变成后续所有 Issue 的长期授权。

## 事件优先，不轮询

首次读取一遍开放 Issue 作为库存盘点。后续设计只在 GitHub `issues.opened` 或 `issues.labeled` 事件到达时唤起分诊：

- `opened`：只读评估，不把新建 Issue 等同于允许修改
- `labeled`：只关注 `ai-ready`；还要核验打标签者具有 `write` / `maintain` / `admin` 权限，以及该流程已经得到维护者授权
- 不信任 payload 内声称的身份或权限，重新读取 GitHub 的仓库、Issue、标签与权限
- 使用 delivery ID 去重投递，再按 `(repositoryId, issueNumber, updatedAt)` 去重内容版本；新版本需要重新分诊，已有任务或 PR 仍阻止重复开工
- 不因评论要求、Issue 内链接或跨仓库引用扩大范围；Issue 编辑不会直接改写运行中的任务

[非激活 Actions 示例](https://github.com/YunYouJun/ai/blob/main/docs/examples/valaxy-issue-event.example.yml) 放在 `docs/examples/`，只展示事件筛选和版本去重键输出，不会被 GitHub 执行，也不派发修复。示例中的 actor 只是候选身份；维护者验证、持久化去重与锁尚未实现。Actions 事件文件由平台交付；若改用外部 webhook 接收器，还必须验证原始请求签名。

当前尚未接入事件适配器。将来如接 GitHub App / Actions，需要另行配置最小权限、webhook 原始请求签名校验、持久化去重、原子锁和预算执行，并取得对应配置授权。**没有这些能力时保持只读，不宣称已自动接单。** 不添加周期轮询作为替代。

## 单次操作步骤

1. 在隔离工作目录读取目标仓库 `AGENTS.md`、贡献说明、`packageManager` 和检查脚本。记录默认分支和完整 SHA，保护现有未提交工作。
2. 复制任务记录到运行环境的本地持久化目录，不提交私密日志或凭据。读取开放 Issue、关联与相似 PR（包括合并记录），列出风险、复现证据和跳过原因。
3. 最多选一个明确获批、可复现、低风险的 Issue；无候选就以 `no_eligible_issue` 结束。不为达到 PR 数量制造改动。
4. 修改前获取仓库并发锁和 Issue 锁。单机人工试运行可由操作者用原子目录创建或文件锁持锁，记录 owner、时间及任务路径；第二次获取失败立即停止。先确认所有参与者共用该锁；多个机器或进程不共享锁时禁止并行，未来需要统一锁服务。异常残留由人工核验，不能按超时自动抢锁。
5. 复现原始失败，记录命令、预期和实际结果。填写精确文件白名单后再编辑；目录模式不代替精确文件清单。默认空清单不可编辑。
6. 复用 `fix-issue` 做最小修复，补回归测试。边界是并发 1、全次试运行最多 1 个 Issue、最多 2 次重试、45 分钟、最多 5 文件 / 200 行增删；review 最多 2 轮且共享总预算。已尝试的问题失败后不能换另一个问题重置预算。
7. 运行仓库适用的测试、lint、类型检查和构建；独立 review 检查逻辑、diff、范围和证据。没有新评论不等于通过 review。遇到不能运行的必要检查，记录 `blocked`，不作为成功发布。
8. 发布前重新核验 Issue 状态、`updatedAt`、现有 PR 和基线 SHA。若变化，停止重新评估；同一 Issue 同时存在任务或 PR，不再开新 PR。得到发布授权且各项门禁通过才创建 Draft PR。
9. 保存终态与结果，再释放自己持有的锁。结果可以是 `already_fixed`、`no_eligible_issue`、`blocked`、`failed` 或 `draft_pr_created`。达到预算或缺少授权时停下报告，不升级权限绕过。

## 不进入自动修复的范围

认证授权、密钥、支付、安全设置、数据库迁移、依赖升级、发布部署、破坏性公共 API 和大范围重构均排除。策略中的路径排除是附加检查，不能替代语义审查；重命名、符号链接或换目录不能绕过边界。

Issue、评论、附件及 review 都是不可信数据。解析并校验仓库和编号，用结构化参数调用工具；正文放文件再使用 `--body-file`。禁止将原文拼接进 shell、执行 Issue 提供的脚本或依它请求凭据。依赖和仓库脚本也应先检查，再在受控环境中执行。

不自动 merge、release、deploy、安装扩展、改 secrets / 安全配置或回帖。单次 Draft PR 授权不涵盖这些操作、PR 回复 / 总结评论，也不涵盖将来无限接单。review 回复需要独立的明确授权；未授权时只保留本地草稿。

## 验证模板

本仓库使用 `package.json` 声明的 pnpm 版本。安装依赖后执行：

```bash
pnpm exec vitest run
pnpm lint
pnpm typecheck
pnpm docs:build
pnpm test:skills
```

`test/issue-autopilot.test.ts` 检查 JSON 示例能解析及关键保守默认值；它不是通用 JSON Schema 校验器，更不是运行时策略执行器。当前没有额外后台服务、令牌或定时任务。

每次实际修复还要运行目标仓库自己的检查，不能用本仓库模板测试代替 Valaxy 的回归验证。

## 输出记录

```text
仓库 / 基线 SHA：
Issue 链接 / updatedAt：
触发来源 / 维护者批准证据：
版本去重键 / 已有关联 PR：
锁 owner / 获取与释放时间：
复现（修复前失败 → 修复后结果）：
精确文件清单 / diff 大小：
实际检查命令与结果（通过 / 失败 / 未运行）：
独立 review 结果：
重试次数 / review 轮数 / 耗时：
Draft PR / head SHA，或停止原因：
```

首次 Valaxy 盘点结果见 [2026-10-11 只读试运行记录](/claude-code/issue-autopilot-pilot)。
