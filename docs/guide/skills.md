---
aside: false
pageClass: skills-catalog
---

<script setup>
import { SkillDirectory } from '@yunyoujun/ai-docs'
import { data as skills } from '../.vitepress/data/skills.data'
</script>

# Skills 目录

本仓库维护的 Skills 都在这里，可按场景筛选或搜索。点击标题或「使用说明」查看用法，命令框右侧一键复制安装命令。

<SkillDirectory :skills="skills" enable-view-toggle search-placeholder="搜索名称、场景或关键词，如 Copilot、iOS">
  <template #detail="{ skill }">
    <dl class="skill-meta">
      <dt>调用</dt>
      <dd><code>{{ skill.command }}</code></dd>
      <dt>来源</dt>
      <dd>{{ skill.origin }}</dd>
    </dl>
  </template>
</SkillDirectory>

## 按场景组合

| 场景       | Skills                                                                                                                  | 说明                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Issue → PR | [`triage-issues`](./skills/triage-issues) → [`fix-issue`](./skills/fix-issue)，或直接用 [`pr-cycle`](./skills/pr-cycle) | 先只读分诊，再复现、修复并创建 Draft PR              |
| 代码审查   | [`review-staged`](./skills/review-staged)、[`review-feedback`](./skills/review-feedback)                                | 提交前自查；PR 收到 Review 后统一处理意见            |
| Copilot    | [`copilot-review-loop`](./skills/copilot-review-loop) → [`address-copilot-review`](./skills/address-copilot-review)     | 循环触发 Copilot Review，每轮交给单轮处理，最多 2 轮 |
| 文档写作   | [`simplify-documents`](./skills/simplify-documents)                                                                     | 按比例精简并审计保护段落                             |
| 发布交付   | [`ios-testflight`](./skills/ios-testflight)                                                                             | 原生 iOS 应用发布到 TestFlight 内部测试              |
| 会话管理   | [`wrap-up`](./skills/wrap-up)                                                                                           | 任务结束时提交本任务改动并归档会话                   |
| 编码约定   | [`yunyoujun`](./skills/yunyoujun)                                                                                       | 在 YunYouJun 的项目或新项目中沿用同一编码风格        |

Issue → PR 与代码审查两类打包在 [`ai-coding` 插件](./plugins#本仓库插件-ai-coding)中，适合一起安装；其余为独立 Skill，按需单独安装。

## 安装与编写

卡片上的命令安装单个 Skill。一次安装全部 Skills、通过插件安装（命令带 `ai-coding:` 前缀）以及本地开发加载见[快速开始](./getting-started)；编写自己的 Skill 见[编写 Skill](./skills/authoring)。

<style scoped>
.skill-meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.skill-meta dt {
  font-weight: 600;
}

.skill-meta dd {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>

<style>
/* 目录页不显示大纲，放宽主题的阅读宽度，让卡片排成三列 */
.skills-catalog {
  --ylf-layout-reading: 100%;
}
</style>
