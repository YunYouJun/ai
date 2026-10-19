# 文档精简 Skill

`simplify-documents` 用于在缩短文档的同时保留事实、约束、决定、操作步骤和关键示例。它适合需求文档、规范、报告、教程和公告，不把“精简”降级成可能遗漏关键条件的自由摘要。

| 调用                  | 触发               | 来源                                                                              |
| --------------------- | ------------------ | --------------------------------------------------------------------------------- |
| `/simplify-documents` | 手动或 AI 自动触发 | [独立 Skill](https://github.com/YunYouJun/ai/tree/main/skills/simplify-documents) |

## 适用场景

- 将文档压缩到指定比例、字数或页数；
- 针对管理者、普通读者、操作人员或专家调整信息密度；
- 删除重复、套话和无效过渡，同时保持原意；
- 逐字保留安全警告、法律条款或用户标记的不可删除段落；
- 对精简结果执行长度和保护段落审计。

如果只需要三句话概括文章或提取中心思想，应直接请求摘要，不必使用本 Skill。

## 安装

```bash
npx skills add YunYouJun/ai --skill=simplify-documents
```

## 使用示例

```text
使用 $simplify-documents 把这份发布说明压缩到原文的 45%，
面向一线运维，并逐字保留两段安全警告。
```

没有明确长度目标时，Skill 默认尝试将输出控制在原文的约 60%，并优先保证信息完整。

## 长度口径

- “压缩到 40%”：输出约为原文的 40%；
- “减少 40%”：输出约为原文的 60%；
- 同时提供字数和比例时：优先采用明确的字数、字符数或页数限制；
- 目标过于激进时：优先保留保护段落、约束、事实和可执行步骤，并报告未达到的比例。

## 审计工具

Skill 包含 `scripts/audit_simplification.py`，可检查非空白字符压缩比例，以及不可删除段落是否逐字、按次数并按原顺序保留。从本仓库根目录运行：

```bash
python3 skills/simplify-documents/scripts/audit_simplification.py \
  --original source.md \
  --simplified concise.md \
  --target-output-ratio 0.60 \
  --protected-file protected.json
```

`protected.json` 是 UTF-8 字符串数组：

```json
[
  "禁止在备份完成前执行数据库迁移。"
]
```

审计失败时命令返回非零退出码，便于接入自动化流程。

## 完整指令

::: details SKILL.md

<<< @/../skills/simplify-documents/SKILL.md

:::
