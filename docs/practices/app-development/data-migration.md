# 升级与数据恢复

以下经验来自云乐坊自有 JSON 快照迁移和 Capacitor → 原生的数据导入。数据库迁移采用所用框架的机制，文末列出官方入口。

## 回退需要旧格式的原始数据

原生快照升级前先保存原始字节；源文件已变化或备份失败时停止写入。旧程序不能读取新格式时，回退使用升级前的原始副本，不能拿新程序重新编码的文件代替。项目已在独立标识的模拟器中验证覆盖升级、停进程后恢复旧格式及重启保持；正式签名升级、真实账号和真机数据保护仍待验。[迁移设计与实测][migration]

## 确认时重新核对账号和磁盘记录

导入确认绑定目标账号、会话代次及记录内容；A → B → A 后必须重新确认。另一个窗口的迟到读取不能改绑目标或重置完成标记，确认时发现副本损坏就停止。原项目的三个并发与完整性回归先失败，修正后通过。[确认边界][confirmation]、[修复证据][regressions]

## WebKit 枚举为空，不足以跳过导入

项目尝试根据网站数据记录 API 的空数组跳过读取，但实测 localStorage 仍有记录，因此撤回了这条捷径。迁移是否有数据应由实际读取与格式校验确定；这个案例仅说明原项目观察到的行为，不是所有 WebKit 版本的保证。[失败实验][empty-enumeration]

## 参考

- [Apple VersionedSchema](https://developer.apple.com/documentation/swiftdata/versionedschema)：使用 SwiftData 时的模型版本入口。
- [Android Room 数据库迁移与测试](https://developer.android.com/training/data-storage/room/migrating-db-versions)：使用 Room 时的迁移路径、历史 schema 与验证方法。

[migration]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-upgrade-migration.md#L85
[confirmation]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-upgrade-migration.md#L35
[regressions]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-upgrade-migration.md#L51
[empty-enumeration]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-upgrade-migration.md#L67
