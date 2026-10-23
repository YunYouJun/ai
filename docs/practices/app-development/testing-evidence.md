# 测试证据与模拟器管理

以下两例来自云乐坊 iOS 实测；模拟器管理摘自项目已采用的约定。

## 节点存在，不代表页面已经画出来

一次 WebView 旅程通过了辅助功能树文字检查，首次打开的截图却仍是白屏。随后对实际截图识别页面标题，分别验证首次打开和恢复后的画面。这里值得复用的是按用户可见结果判断是否显示；截图识别是该项目的验证手段，不是所有 UI 测试的必选实现，也不能据此声称性能改善。[原始失败与收紧后的复验][painting]

## 先确认测试是否真正开始

两次 XCTest 在控制通道建立前退出，没有测试用例开始；换用 USB 后同一签名产物开始执行并通过。记录失败阶段和对照结果，不能将“没有断言失败”记为通过，也不能据此认定产品崩溃或无线连接的内部根因。[连接失败与 USB 对照][connection]

## 模拟器按归属复用和回收

项目采用以下约定：

- 测试前核对状态与归属，优先复用可用且空闲的设备；不因提交或测试轮次不同就新建。
- 需要独立数据或并行测试时才新建，记录名称与 UDID；不擦除借用设备的数据，不抢占其他任务的设备。
- 导出必要证据后，在同一任务内关闭并删除自己创建的临时设备，再核对设备列表；失败或中止也清理，除非用户明确要求保留。

来源：[项目 AGENTS.md][simulators]。这是已采用的规则，不表示历史记录中的每次测试都已证明完成清理。

## 参考

- [Apple XCTest](https://developer.apple.com/documentation/xctest)：单元、性能与 UI 测试入口。

[painting]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-device-validation.md#L46
[connection]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-device-validation.md#L31
[simulators]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/AGENTS.md#L3
