# ASC CLI 执行流程

下列命令已按 Homebrew 的 ASC CLI **5.14.3** 帮助核对；上游最新版本可能先于 Homebrew 发布。安装用 `brew install asc`，已有安装先看 `asc version`。升级后按本机帮助校对参数，不把未经核对的新旗标直接加入发布。

本技能不依赖另一个 Skill 的安装。[上游 CLI](https://github.com/rorkai/App-Store-Connect-CLI) 及 [社区 Skills](https://github.com/rorkai/app-store-connect-cli-skills) 提供更多操作参考；当前流程只使用以下能力。

## 变量与准备

从项目文档设置 `APP_ID`、`BUNDLE_ID`、`TEAM_ID`、`IOS_PROJECT`、`IOS_SCHEME`、`IOS_VERSION`、`IOS_BUILD`、`GROUP_ID`、`EXPORT_OPTIONS`、`PRIVACY_MANIFEST`、`ENCRYPTION`、`ARCHIVE`、`IPA`、`RELEASE_DIR`、`WHATS_NEW`。`SKILL_DIR` 是当前读取的共用 Skill 实际安装目录，不是应用工作目录；不要假设固定在 `~/.codex/skills`。

沿用项目凭据环境，给 ASC CLI 显式映射私钥路径。在当前子 Shell 中清除会覆盖认证来源的旧变量，不改变全局配置：

```bash
unset ASC_PROFILE ASC_CONFIG_PATH ASC_BYPASS_KEYCHAIN
unset ASC_PRIVATE_KEY ASC_PRIVATE_KEY_B64
export ASC_KEY_TYPE=team
export ASC_PRIVATE_KEY_PATH="$ASC_KEY_P8"
export API_PRIVATE_KEYS_DIR="$(dirname "$ASC_KEY_P8")"
test -f "$ASC_KEY_P8"
test "$(stat -f '%Lp' "$ASC_KEY_P8")" = 600

asc builds next-build-number --app "$APP_ID" --version "$IOS_VERSION" \
  --platform IOS --output json > "$RELEASE_DIR/next-build.json"
```

该查询也考虑上传中的构建。根据结果更新项目的版本来源并提交，不能直接用通用 Xcode 版本编辑器改生成工程后忘记 XcodeGen 源文件。产物目录应是本次新建目录，已有回执先检查，不覆盖上次产物。

## 归档、导出、IPA 与 Apple 校验

在项目要求的依赖安装、资源准备和 XcodeGen 之后执行；签名参数按项目文档调整。ASC CLI 的重复 `--xcodebuild-flag` 每次传一个原始参数：

```bash
asc xcode archive --project "$IOS_PROJECT" --scheme "$IOS_SCHEME" \
  --configuration Release --archive-path "$ARCHIVE" \
  --xcodebuild-flag=-destination --xcodebuild-flag=generic/platform=iOS \
  --xcodebuild-flag=-derivedDataPath --xcodebuild-flag="$RELEASE_DIR/DerivedData" \
  --xcodebuild-flag=-allowProvisioningUpdates \
  --xcodebuild-flag=-authenticationKeyPath --xcodebuild-flag="$ASC_KEY_P8" \
  --xcodebuild-flag=-authenticationKeyID --xcodebuild-flag="$ASC_KEY_ID" \
  --xcodebuild-flag=-authenticationKeyIssuerID --xcodebuild-flag="$ASC_ISSUER_ID" \
  --output json > "$RELEASE_DIR/archive.json" 2> "$RELEASE_DIR/archive.log"

mkdir -p "$(dirname "$IPA")"
cp "$EXPORT_OPTIONS" "$RELEASE_DIR/ExportOptions.plist"
asc xcode export --archive-path "$ARCHIVE" --ipa-path "$IPA" \
  --export-options "$RELEASE_DIR/ExportOptions.plist" \
  --xcodebuild-flag=-allowProvisioningUpdates \
  --xcodebuild-flag=-authenticationKeyPath --xcodebuild-flag="$ASC_KEY_P8" \
  --xcodebuild-flag=-authenticationKeyID --xcodebuild-flag="$ASC_KEY_ID" \
  --xcodebuild-flag=-authenticationKeyIssuerID --xcodebuild-flag="$ASC_ISSUER_ID" \
  --output json > "$RELEASE_DIR/export.json" 2> "$RELEASE_DIR/export.log"

python3 "$SKILL_DIR/scripts/verify_release.py" ipa --ipa "$IPA" \
  --bundle-id "$BUNDLE_ID" --version "$IOS_VERSION" --build "$IOS_BUILD" \
  --team-id "$TEAM_ID" --privacy-manifest "$PRIVACY_MANIFEST" \
  --encryption "$ENCRYPTION" > "$RELEASE_DIR/ipa-check.json"

xcrun altool --validate-app "$IPA" --api-key "$ASC_KEY_ID" \
  --api-issuer "$ASC_ISSUER_ID" --output-format json \
  > "$RELEASE_DIR/validate.json" 2> "$RELEASE_DIR/validate.log"
```

不要省略 `--export-options`，ASC CLI 自动生成的默认配置不保证仅内部测试。导出文件先审查四个固定键及项目签名/符号设置。当前 ASC CLI 没有 `builds validate` 子命令；`asc validate` 是商店发布就绪检查，不能替代这里的 Apple IPA 校验。

## 上传与等待

只有本次任务已授权上传、前述校验成功时执行。先把 IPA 与校验回执哈希再比较一次：

```bash
python3 - "$IPA" "$RELEASE_DIR/ipa-check.json" <<'PY'
import hashlib, json, sys
with open(sys.argv[1], 'rb') as stream:
    digest = hashlib.sha256()
    for block in iter(lambda: stream.read(1024 * 1024), b''):
        digest.update(block)
if digest.hexdigest() != json.load(open(sys.argv[2]))['sha256']:
    raise SystemExit('IPA changed after validation')
PY

asc builds upload --app "$APP_ID" --ipa "$IPA" --version "$IOS_VERSION" \
  --build-number "$IOS_BUILD" --output json > "$RELEASE_DIR/upload.json" \
  2> "$RELEASE_DIR/upload.log"

asc builds wait --app "$APP_ID" --build-number "$IOS_BUILD" \
  --version "$IOS_VERSION" --platform IOS --fail-on-invalid \
  --timeout 50s --report-pending --output json > "$RELEASE_DIR/wait.json"
```

wait 退出码 7 表示仍待发现/处理，保存回执，退避后用同一选择器续查；其他非零码需检查错误。不要用 `--latest`，也不要因等待未结束而重新上传。

**`asc builds upload --dry-run` 会在服务端预留上传操作，并不是只读预检。** 本流程不使用它作为审核计划。上传不明确时使用 `asc builds uploads list --app "$APP_ID"` 和精确构建查询恢复状态；不要加 `--include-sensitive` 输出签名 URL。

## 内部发布与验收

```bash
python3 "$SKILL_DIR/scripts/verify_release.py" server --phase ready \
  --app-id "$APP_ID" --bundle-id "$BUNDLE_ID" --version "$IOS_VERSION" \
  --build "$IOS_BUILD" --group-id "$GROUP_ID" \
  --evidence-dir "$RELEASE_DIR/asc-ready" > "$RELEASE_DIR/ready.json"

BUILD_ID="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["buildId"])' "$RELEASE_DIR/ready.json")"
asc builds add-groups --build-id "$BUILD_ID" --group "$GROUP_ID" \
  --dry-run --output json > "$RELEASE_DIR/group-plan.json"
```

检查只读结果及组关联计划。`ready.json` 的 `buildAttached=true` 时沿用自动分发；否则在已授权发布范围内执行 `asc builds add-groups --build-id "$BUILD_ID" --group "$GROUP_ID" --output json`。这里不加 `--submit`、`--notify` 或新增成员命令。

先 `asc builds test-notes list --build-id "$BUILD_ID" --locale zh-Hans --paginate --output json` 查看当前说明；不存在时用 `create`，已存在且不同则用 `update`：

```bash
asc builds test-notes update --build-id "$BUILD_ID" --locale zh-Hans \
  --whats-new "$WHATS_NEW" --output json > "$RELEASE_DIR/test-notes.json"

python3 "$SKILL_DIR/scripts/verify_release.py" server --phase published \
  --app-id "$APP_ID" --bundle-id "$BUNDLE_ID" --version "$IOS_VERSION" \
  --build "$IOS_BUILD" --group-id "$GROUP_ID" \
  --evidence-dir "$RELEASE_DIR/asc-published" > "$RELEASE_DIR/published.json"
```

核验工具只运行 ASC CLI 的只读查询，比较 App 和组各自的父应用、营销版本、iOS 平台、构建号、仅内部受众、未过期、完整组关联、公开链接、成员数及内部/外部状态。输出没有测试员姓名或邮箱；非零退出时保留诊断并处理原因，不能将部分查询结果记为完成。

已有组的自动分发、反馈或成员需要调整时先查看项目文档与当前值；日常更新沿用原配置。首次建档仍需 App Store Connect 网页。网页会话失效不阻塞已授权的 API 发布，可用 API 回执验收并记录缺少截图的原因。
