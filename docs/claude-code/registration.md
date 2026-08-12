# Claude Code 使用前准备

Claude Code 的账号、可用地区、套餐和计费规则可能调整。开始前请以 Anthropic 官方信息为准，不要使用临时接码、虚构地址或与本人不一致的账单资料。

## 1. 确认可用地区

Anthropic 要求用户位于其[支持的国家和地区](https://support.claude.com/en/articles/8461763-where-can-i-access-claude)。如果你所在的地区暂未开放，请等待官方支持，或选择当地可合法使用的其他服务。

注册时使用自己的邮箱、手机号及真实身份信息，并遵守 Anthropic 的服务条款和当地法律。

## 2. 选择认证和计费方式

Claude Code 支持以下常见方式：

- **Claude App 套餐**：使用包含 Claude Code 的 Pro、Max、Team 或 Enterprise 套餐登录；具体价格以[官方价格页面](https://claude.com/pricing)为准。
- **Anthropic Console**：使用启用计费的 Console 账号，按 API 用量付费。
- **企业平台**：通过 Amazon Bedrock、Google Vertex AI 或 Microsoft Foundry 等受支持的平台接入。

::: warning
Claude App 套餐与 Anthropic Console API 是两套计费方式。如果环境中设置了 `ANTHROPIC_API_KEY`，Claude Code 可能优先使用 API Key 并产生独立的 API 费用。
:::

订阅或开通计费时，请填写与付款方式一致的真实账单地址。税费会根据所在地区和结算页面的规则计算。

## 3. 安装 Claude Code

安装前请确认系统满足[官方要求](https://code.claude.com/docs/en/installation)。官方推荐使用原生安装器；macOS、Linux 或 WSL 运行：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell 运行：

```powershell
irm https://claude.ai/install.ps1 | iex
```

也可以按官方文档改用 Homebrew、WinGet 或 npm。不要使用 `sudo npm install -g`，以免引入权限和安全问题。

进入项目目录后启动：

```bash
claude
```

首次运行时，根据提示选择 Claude App、Anthropic Console 或企业平台完成登录。已经登录但需要切换认证方式时，可以在 Claude Code 中运行 `/login`。

## 4. 检查安装与费用

```bash
claude doctor
```

使用 Claude App 套餐时，可通过 `/usage` 查看套餐用量，通过 `/status` 核对版本、模型、账号和连接状态。使用 Console API 或企业平台时，请同时在对应平台检查预算、自动充值和用量告警设置。

## 官方资料

- [Claude Code 安装](https://code.claude.com/docs/en/installation)
- [Claude Code 认证方式](https://code.claude.com/docs/en/authentication)
- [Claude Code 使用 Pro 或 Max 套餐](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan)
- [Claude 支持的国家和地区](https://support.claude.com/en/articles/8461763-where-can-i-access-claude)
