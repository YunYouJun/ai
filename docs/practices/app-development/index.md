# App 开发实践

只补充项目里实际遇到的问题和明确采用的约定；通用知识优先参考官方与社区文档。新增经验应有项目来源和适用条件，没有新证据就不扩写。

首批整理于 2026-10-24，来自云乐坊的 iOS 开发记录。来源链接固定到整理时的提交，验证范围与待验项见原文；这些记录不代表其他平台也已验证。

## 核心实践

| 主题                                       | 保留的经验                                                 |
| ------------------------------------------ | ---------------------------------------------------------- |
| [账号切换与异步结果](./account-isolation)  | A → B → A 的旧结果、WebView 持久身份与草稿、缓存的权限边界 |
| [升级与数据恢复](./data-migration)         | 旧格式原字节备份、迁移确认失效、WebKit 空枚举的误判        |
| [测试证据与模拟器管理](./testing-evidence) | 节点存在但画面白屏、测试未开始、设备归属与清理             |

## 已有流程与外部参考

- 发布沿用 [TestFlight 内部测试 Skill](/guide/skills/ios-testflight)。工程、签名、版本和内部组参数继续留在各 App 仓库。
- 界面、交互与无障碍参考 [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)。
- 认证与授权参考社区的 [OWASP MASVS-AUTH-1](https://mas.owasp.org/MASVS/controls/MASVS-AUTH-1/)，具体并发、存储和测试资料列在各专题末尾。

项目实现、完整测试报告和一次性排障过程继续留在项目文档；本目录只保留值得下一款 App 复用的结论与链接。
