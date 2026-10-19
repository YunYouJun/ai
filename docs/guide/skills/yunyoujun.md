# 编码偏好与工具约定

`yunyoujun` 记录 YunYouJun 在 JavaScript / TypeScript 项目中的编码偏好和工具约定。在 YunYouJun 的项目中工作、新建项目，或希望沿用同一风格时，AI 会按上下文自动加载。

| 调用         | 触发               | 来源                                                                     |
| ------------ | ------------------ | ------------------------------------------------------------------------ |
| `/yunyoujun` | 手动或 AI 自动触发 | [独立 Skill](https://github.com/YunYouJun/ai/tree/main/skills/yunyoujun) |

## 安装

```bash
npx skills add YunYouJun/ai --skill=yunyoujun
```

## 涵盖内容

| 主题       | 要点                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| 通用       | 代码、注释与提交信息用英文，文档用简体中文；偏好函数式和具名导出                                       |
| TypeScript | `interface` 优先、公共 API 显式返回类型、不用 `enum`、`import type`                                    |
| Vue        | Vue 3 `<script setup lang="ts">`、宏 API、VueUse                                                       |
| 命名       | 文件 `kebab-case`、组件 `PascalCase`、常量 `SCREAMING_SNAKE_CASE`                                      |
| Git        | Conventional Commits                                                                                   |
| 注释与文档 | 注释说明原因而不是复述代码；JSDoc / TSDoc 与 Vue 组件文档规范                                          |
| 模块组织   | 按功能分组，`index.ts` 只做再导出                                                                      |
| 工具链     | pnpm（workspace 与 catalogs）、`@antfu/eslint-config`、Vite、VitePress、UnoCSS、Vitest、GitHub Actions |

这是个人约定。用于其他团队时，可以复制后按自己的规范修改。

## 完整指令

::: details SKILL.md

<<< @/../skills/yunyoujun/SKILL.md

:::
