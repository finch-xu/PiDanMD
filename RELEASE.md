# 发版流程（v1.0 以后）

## 首次发版前的一次性准备

### 1. 生成 Tauri Updater 签名密钥对

```bash
pnpm tauri signer generate -w ~/.tauri/pidan.key
```

输出包含**公钥**和**私钥**。

- **公钥**：粘到 `src-tauri/tauri.conf.json` 的 `plugins.updater.pubkey` 字段（替换 `REPLACE_WITH_YOUR_TAURI_UPDATER_PUBKEY`）
- **私钥**：内容粘到 GitHub repo secrets 的 `TAURI_SIGNING_PRIVATE_KEY`
- **密码**：粘到 GitHub repo secrets 的 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

⚠️ **私钥永远不要 commit 到仓库**。`~/.tauri/pidan.key` 也建议加到全局 gitignore。

### 2. (macOS 可选) Apple 公证证书

如果想发布签名公证后的 macOS 版本，在 secrets 里配置以下（workflow 已留接口）：

- `APPLE_CERTIFICATE`（base64 编码的 .p12）
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_PASSWORD`（App-specific password）
- `APPLE_TEAM_ID`

未配置时构建仍会成功，只是 macOS 用户首次打开需手动允许"开发者无法验证的应用"。

---

## 每次发版

### 1. 升版本号（三处同步）

```
package.json                "version": "1.0.0"
src-tauri/Cargo.toml        version = "1.0.0"
src-tauri/tauri.conf.json   "version": "1.0.0"
```

可以一条 sed 搞定，也可以走 commit-commands 的 `/release`。

### 2. 在 GitHub 上创建 Release

- Tag 形如 `v1.0.0`
- Title 形如 `PiDanMD v1.0.0 · 极简中文写作工具`
- Body 写更新内容（参考 `docs/RELEASE_v1.0.md` 模板）

Release 发布瞬间触发 `.github/workflows/release.yml`：
- 4 个 platform job 并行构建（macOS-arm64、Windows-x86_64、Windows-arm64、Linux-x86_64）
- 每个 job 上传产物到 release，并附带 `.sig` 签名文件
- 所有 build 完成后 `publish-manifest` job 跑 `scripts/build-latest-json.sh`，生成 `latest.json` 上传

### 3. 验证自动更新

1. 装一个老版本（v0.2.3 仍可下载）
2. 启动 → 等 3 秒应该弹出"v1.0.0 可用"卡片
3. 点"下载并安装"→ 进度条 → "立即重启"

如果未弹出，按以下顺序排查：
- 检查 release 上 `latest.json` 是否存在且 platforms 字段完整
- 检查 `tauri.conf.json` 的 `pubkey` 是否与签名密钥的公钥一致
- 检查 app 内置版本号是否**低于** release 版本（updater 只在远端版本更高时提示）

### 4. 紧急回滚

如果某个版本有严重 bug：
1. 在 GitHub 上把对应 release 标记为 draft / unpublished
2. 重新发一个 patch 版本（v1.0.1）覆盖 `latest.json`
3. 用户下次启动 app 会拿到新的 `latest.json`，自动覆盖

不能"撤回"已经被用户下载的版本——只能用补丁覆盖。

---

## 平台产物清单

`build-latest-json.sh` 识别这些主产物作为 updater 入口：

| Platform key | 资产模式 |
|---|---|
| `darwin-aarch64` | `*macos*aarch64*.app.tar.gz` |
| `windows-x86_64` | `*windows*x86_64*.nsis.zip` |
| `windows-aarch64` | `*windows*arm64*.nsis.zip` |
| `linux-x86_64` | `*linux*x86_64*.AppImage` |

`.dmg` / `.msi` / `.deb` 是给首次安装的用户用的，不参与自动更新流程（Tauri updater 需要可在程序运行时替换的格式）。

---

## CI 工作流文件位置

- `.github/workflows/release.yml` — release workflow
- `scripts/build-latest-json.sh` — manifest 生成脚本
- `src-tauri/tauri.conf.json` — updater endpoint + pubkey 配置
- `src-tauri/capabilities/default.json` — updater + process 权限
- `src/features/updater/` — 前端 hook + 横幅 UI
