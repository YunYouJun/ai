---
name: simplify-documents
description: Condense and rewrite documents while preserving facts, constraints, decisions, procedures, and essential examples. Use when the user asks to shorten, simplify, tighten, de-duplicate, or remove filler from a report, specification, policy, guide, proposal, announcement, or other document; adapt it for a target audience; meet a requested output ratio, reduction percentage, word count, or page limit; protect passages that must not be deleted or altered; or produce a faithful concise version rather than a free-form summary. Also use for Chinese requests containing 精简、压缩、缩写、删减、去重、去掉空话、保留指定段落、不可删除段落、压缩比例、字数限制. Works with pasted text and extracted document text; use the relevant format-specific skill as well when file parsing, tracked changes, or layout preservation is required.
---

# 文档精简

在不悄然改变含义的前提下缩短文档。将信息保真和保护段落视为硬约束；除非用户明确提高长度目标的优先级，否则将长度目标视为尽力目标。

## 明确任务简报

1. 确认原文、目标读者、使用目的、语气、输出格式、长度目标和保护段落。
2. 用户需要可复用的需求表单时，使用 `assets/simplification-brief.md`。
3. 对无风险的缺省信息直接作合理推断，不要因此阻塞。用户未指定时，沿用原文语言、结构和大致受众。仅当用户要求精简但未给出长度目标时，默认尝试将输出控制在原文约 60%。
4. 统一解释长度要求：
   - “压缩到 40%”表示输出比例为 `0.40`；
   - “减少 40%”表示输出比例为 `0.60`；
   - 对含义不清的“40% 压缩比例”，按输出比例 `0.40` 处理，并在校验说明中声明该假设；
   - 同时出现百分比和明确字数、字符数或页数限制时，优先采用明确限制。
5. 除非用户明确允许改写，否则将所有标记为不可删除的段落视为逐字保护文本，保留其字符、标点、顺序和内部格式。

## 建立保真清单

改写前先在内部盘点原文。每项只记录一次，并跟踪它在结果中的位置：

- **事实**：姓名、数字、单位、日期、版本、状态、范围、证据和因果主张；
- **约束**：要求、禁令、例外、前置条件、截止时间、权限，以及“必须”和“可以”等强度差异；
- **决定**：选定方案、负责人、理由和未决问题；
- **操作步骤**：顺序、分支条件、命令、字段、界面标签、预期结果、回滚和安全步骤；
- **关键示例**：仅保留用于解释独特规则、边界情况、计算方法或预期结果的示例；
- **保护段落**：复制原文中的精确片段，标记为逐字保留。

除非用户要求，否则不要展示保真清单。处理政策、法律、合规、安全或高技术性材料时，改写前阅读 `references/simplification-rules.md`。

## 按优先级改写

1. 先把保护段落原样放入草稿。
2. 保留每一项保真内容，使条件和否定词紧邻其约束的主张。
3. 删除完全重复的内容、寒暄、铺垫、空泛强调、自明过渡和元叙述。
4. 仅当范围、确定性、执行者、时间和约束强度完全一致时合并句子。
5. 使用适合目标读者的直接表达替换冗长短语。为新手解释必要术语，为专家保留精确领域词汇。
6. 仅在对应关系仍然明确时，将并列内容合并为列表或表格。
7. 先删重复示例，再考虑删除独特示例；不得编造替代事实或示例。
8. 保持可执行顺序。前置条件、执行者、命令、校验或失败处理不同的步骤不得合并。

如果保护段落或必留内容本身已超过长度目标，保留这些内容并报告冲突。不得通过删除或弱化硬约束来满足比例。

## 校验结果

执行所有适用检查：

1. **保真**：对照保真清单，核对数字、单位、日期、名称、范围、因果关系、确定性、否定、条件和例外。
2. **操作**：核对步骤顺序、前置条件、命令、字段名、警告和预期结果。
3. **保护**：以精确子串搜索每个保护段落，核对出现次数和原文顺序，不依赖视觉相似性。
4. **受众**：确认词汇、背景假设和细节密度适合目标读者，同时不改变实质内容。
5. **长度**：按用户指定口径测量。只有输出比例而未指定口径时，使用非空白字符数，默认允许 ±5 个百分点。
6. **可读性**：删除新引入的重复，并修复悬空指代、未定义缩写和模糊代词。

对于纯文本或 Markdown 输入，只要指定了比例或保护段落，就运行附带审计。先定位本 `SKILL.md` 所在目录，再以该目录解析脚本路径；不要假设用户当前工作目录就是 Skill 目录：

```bash
python3 /path/to/simplify-documents/scripts/audit_simplification.py \
  --original source.md \
  --simplified concise.md \
  --target-output-ratio 0.60 \
  --protected-file protected.json
```

保护段落文件应为 UTF-8 JSON 字符串数组。审计会报告输出比例和缩减比例、应用默认容差、核对段落的精确内容、出现次数和顺序，并在失败时返回非零退出码。不需要比例或保护检查时，可省略对应可选参数。

## 交付结果

以精简后的文档作为主要输出。仅在用户指定长度目标、标记保护文本、需要披露假设或存在无法满足的约束时，附上一段简短校验说明，其中包括：

- 按用户指定口径计算的实际长度和比例；
- 所有保护段落是否逐字、按次数且按原顺序保留；
- 仍存在的目标冲突或保真风险。

除非用户要求，不要额外添加通用摘要、变更日志或保真清单，以免抵消精简效果。
