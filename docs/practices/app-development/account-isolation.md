# 账号切换与异步结果

适用于多账号 App，以及内嵌网页需要独立保存登录态和草稿的场景。

## 同一个账号，也可能已经换过会话

云乐坊的同步回归覆盖了 A → B → A：请求返回时 UID 虽然相同，已不是发起请求时的会话。异步结果写入前同时核对账号与会话代次；授权还要核对原请求和页面。取消任务之外，仍保留结果提交前的有效性检查。[同步回归与验证记录][sync]、[授权边界][authorization]

## 隔离身份，也保留原账号的数据

项目曾在重新创建 WebView 后仍读到旧账号身份。iOS 17+ 改为按账号及应用范围分配持久仓库后，验证了 A → B → A 的身份隔离和各自草稿保留。验收同时检查“B 看不到 A 的数据”和“回到 A 后数据仍在”；关闭页面或整库删除都不能独自证明这两点。[故障与分仓修复][partition]、[两个消费端的实测][consumers]

该分仓方案的证据限于原文记录的系统和消费端，不能推广到 iOS 16 或未知归属的旧默认仓库。真实已签码后的迟到授权仍有最终版本复验未完成项，见[原记录][late-result]。

## 本机记录不授予权限

云居同步只保存应用引用与用户选择，打开时重新读取当前服务端状态；备份、旧网址和已购缓存不能据此授予访问权。[同步数据边界][references]

## 参考

- [Swift Concurrency：Task Cancellation](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/#Task-Cancellation)：任务取消机制。
- [OWASP MASVS-AUTH-1](https://mas.owasp.org/MASVS/controls/MASVS-AUTH-1/)：认证与授权的服务端边界。

[sync]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-home-sync.md#L74
[authorization]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-host-authorization.md#L29
[partition]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-host-authorization.md#L81
[consumers]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-host-authorization.md#L187
[late-result]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-host-authorization.md#L211
[references]: https://github.com/YunLeFun/apps.yunle.fun/blob/7c1c4c8b1c6be4f06c7a83916b723fb31360ea30/docs/dev/ios-home-sync.md#L60
