---
name: ios-testflight
description: Prepare, validate and publish native iOS builds to TestFlight internal testing using ASC CLI and project release documents. Use for TestFlight updates, including 云乐坊 and 云生; verify internal distribution and update a phone only when requested.
---

# TestFlight 内部测试

唯一维护源为 `YunYouJun/ai/skills/ios-testflight/`。先读目标仓库的发布文档，取得工程、Scheme、正式 Bundle ID、App ID、版本来源、导出配置、Team、内部组及隐私清单路径。项目参数不放进通用执行工具。

| 项目入口          | 仓库                      | 发布文档                       |
| ----------------- | ------------------------- | ------------------------------ |
| `ios-deploy`      | `YunLeFun/apps.yunle.fun` | `docs/dev/testflight.md`       |
| `life-testflight` | `YunYouJun/life`          | `docs/guide/ios-testflight.md` |

这两个项目均默认发布 `apps/ios` 原生客户端。旧 Capacitor 不是原生发布的前置步骤。

## 执行

优先使用 ASC CLI 完成归档、导出、版本查询、上传、测试说明和组关联。实际命令与认证映射见 [ASC CLI 流程](references/asc-cli.md)；升级工具后先核对本机 `asc version` 和相关 `--help`。不复制社区整套 Skills 或维护另一套 ASC HTTP/JWT 客户端；需要其他 Apple 能力时查阅 [上游 Skills](https://github.com/rorkai/app-store-connect-cli-skills)。

1. **确定源码与范围。** 只打包时做到校验；当前请求明确要求上传或更新 TestFlight 时继续内部发布，已有明确授权不重复询问。迁移技能或修改文档本身不授权新上传。基于最新远端 main 或指定提交，用独立工作树保护其他任务改动。归档前提交版本，记录实际源码与 main 的对应关系。
2. **确定版本。** 用 ASC CLI 查询已处理及上传中的构建号，再修改项目自己的版本来源。云乐坊跟踪生成的 Xcode 工程，云生忽略生成工程；不要混入个人 Info.plist 或签名配置。
3. **分步归档和导出。** 使用 Release 与正式标识。导出配置固定 `method=app-store-connect`、`destination=export`、`testFlightInternalTestingOnly=true`、`manageAppVersionAndBuildNumber=false`，显式传给 `asc xcode export`。保留各项目的 Swift 符号选项。不要使用直接上传导出或一键构建发布来跳过 IPA 检查。
4. **核验同一个 IPA。** 用本技能的 `scripts/verify_release.py ipa` 核对唯一 App、标识、版本、构建号、仅内部标记、分发签名、描述文件、调试权限及与项目声明一致的隐私清单；用途声明还需按实际功能审查。归档的开发签名不替代 IPA 检查。Apple 包校验继续使用官方 `altool --validate-app`；无错误后才通过 ASC CLI 上传同一 SHA-256 的文件。
5. **上传并恢复处理。** 保存上传与构建 ID、哈希和脱敏回执。不明确时先查询构建或 upload 状态，不盲目重传。等待使用精确 App、iOS 营销版本和构建号，有限时长后退避续查；`INVALID`、`FAILED` 都算失败。修复后使用未占用的新构建号。
6. **内部发布。** `scripts/verify_release.py server --phase ready` 通过后，按精确 Build ID 对已有内部组运行 `asc builds add-groups --dry-run`。核对目标及计划，再在已授权发布范围内执行必要关联和测试说明更新；自动分发已关联时不重复关联。沿用现有成员，不自动建组或发邀请，不跨 App 使用 tester ID。不启用外测、公开链接或 Beta App Review。
7. **验收。** 运行 `server --phase published`：要求 `VALID`、未过期、`INTERNAL_ONLY`、正确 App/版本/组、有内部成员、`IN_BETA_TESTING`、外部 `NOT_APPLICABLE`，且没有外部组关联。上传成功不等于发布完成。核验脚本只调用 ASC CLI 的只读命令，没有上传或写入操作。

## 手机、回退与交付

仅在用户要求安装或更新手机时，从 TestFlight 更新正式标识，核对版本、“打开”、正常启动、原有数据和自动更新。不先卸载正式版。首次从独立开发标识切换或清理重复 App 时先读项目迁移文档：云生 `.dev` 容器独立；云乐坊旧壳保留容器不等于 WebKit 数据已导入。备份和验证完成后再清理对应测试 App，普通同标识更新不重做迁移。

ASC CLI 不可用或存在已确认的兼容问题时，可以按项目文档使用已有 Xcode/altool 脚本回退，记录原因并保留全部仅内部限制和验收条件。一次命令失败不自动授权换 App、放宽分发范围、重传或升级全局环境。

凭据仅通过运行时环境或已有授权的认证配置提供，`.p8` 权限为 600。不要写入仓库、输出私钥/JWT/完整测试员邮箱，或提交手机备份。项目切换时显式重设 App 和组参数。登录、协议或锁屏需用户处理时保留进度并说明具体待办。

产物存仓库外，保留提交与源码副本、版本、归档和 dSYM、导出配置、IPA 哈希、校验/上传/发布回执及可核验的截图。无需模拟器时不创建；使用设备时遵守项目归属和清理约定。最终分别报告服务器发布、手机验证的实际结果。
