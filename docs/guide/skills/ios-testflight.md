# TestFlight 内部测试 Skill

`ios-testflight` 为原生 iOS 应用提供共用发布流程。ASC CLI 负责归档、导出、上传、版本查询、测试说明和组关联；Skill 统一源码、仅内部分发、IPA 校验及最终验收。Apple IPA 校验沿用 `altool --validate-app`。

## 安装与使用

```bash
npx skills add YunYouJun/ai --skill=ios-testflight
brew install asc
```

```text
使用 $ios-testflight，把这个项目基于最新 main 打包、校验并上传到现有 TestFlight 内测组。
```

只要求打包或校验时不会进入上传。Skill 迁移、文档更新和只读检查也不会触发新发布。明确要求发布后沿用已有授权，不反复确认同一操作。

## 应用仓库负责的内容

| 项目   | 入口              | 发布文档                                                                                    |
| ------ | ----------------- | ------------------------------------------------------------------------------------------- |
| 云乐坊 | `ios-deploy`      | [原生发布流程](https://github.com/YunLeFun/apps.yunle.fun/blob/main/docs/dev/testflight.md) |
| 云生   | `life-testflight` | [原生发布流程](https://github.com/YunYouJun/life/blob/main/docs/guide/ios-testflight.md)    |

工程、Scheme、App/Bundle ID、Team、内部组、版本来源、导出配置、隐私清单及首次开发版数据迁移保留在应用仓库。共用 Skill 不依赖本机固定仓库位置，也不跨应用复制测试员和元数据。

## 校验与社区复用

内置 `scripts/verify_release.py` 校验已导出的 IPA，或通过 ASC CLI 只读查询精确构建、内部组及发布状态。服务器验收要求 `VALID / INTERNAL_ONLY / IN_BETA_TESTING`，外部 `NOT_APPLICABLE`，内部组有成员且构建未关联外部组。

当前流程按 ASC CLI 5.14.3 核对。升级后先查看本机帮助：`builds upload --dry-run` 会预留上传操作，不是只读预检；组关联预检使用 `builds add-groups --dry-run`。源码和完整命令见 [SKILL.md](https://github.com/YunYouJun/ai/blob/main/skills/ios-testflight/SKILL.md) 与 [ASC CLI 参考](https://github.com/YunYouJun/ai/blob/main/skills/ios-testflight/references/asc-cli.md)。

底层复用 [ASC CLI](https://github.com/rorkai/App-Store-Connect-CLI)，按需参考 [社区 Skills](https://github.com/rorkai/app-store-connect-cli-skills)，不在本仓库复制上游整套实现。项目已有 Xcode/altool 脚本保留为兼容回退，使用时仍须执行相同的内部限制和验收。
