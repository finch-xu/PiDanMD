#!/usr/bin/env bash
# ── 生成 Tauri updater 用的 latest.json 并上传到 GitHub Release ──
#
# 调用者负责设置以下环境变量：
#   TAG       - release tag，例如 v1.0.0
#   REPO      - owner/repo，例如 finch-xu/PiDanMD
#   GITHUB_TOKEN - 用于 gh CLI 鉴权
#
# 工作流程：
#   1. 列出 release 资产
#   2. 按平台找到主产物 + 对应 .sig 签名文件
#   3. 拼接 Tauri updater manifest 格式（version, notes, pub_date, platforms）
#   4. 上传 latest.json 到同一 release

set -euo pipefail

: "${TAG:?TAG env var required}"
: "${REPO:?REPO env var required}"
: "${GITHUB_TOKEN:?GITHUB_TOKEN env var required}"

VERSION="${TAG#v}"
DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
BASE_URL="https://github.com/${REPO}/releases/download/${TAG}"

# 一次性拿到全部资产元数据
ASSETS_JSON=$(gh release view "$TAG" --repo "$REPO" --json assets)

# 找到匹配指定正则的非 .sig 文件，并读取其 .sig 签名内容
# 输出 "<filename>|<signature>"，找不到则输出空
find_asset() {
  local pattern="$1"
  local name
  name=$(echo "$ASSETS_JSON" | jq -r ".assets[] | select(.name | test(\"${pattern}\") and (endswith(\".sig\") | not)) | .name" | head -n1)
  if [ -z "$name" ]; then
    echo ""
    return
  fi
  local sig_name="${name}.sig"
  local sig_content=""
  if echo "$ASSETS_JSON" | jq -e ".assets[] | select(.name == \"${sig_name}\")" > /dev/null; then
    gh release download "$TAG" --repo "$REPO" --pattern "${sig_name}" --dir /tmp --clobber
    sig_content=$(cat "/tmp/${sig_name}" | tr -d '\n')
  fi
  echo "${name}|${sig_content}"
}

# 各平台主产物识别（tauri-action 默认命名约定）
# - macOS: .app.tar.gz（updater 用）
# - Windows: .nsis.zip（updater 用）
# - Linux: .AppImage（updater 用）
DARWIN_AARCH64=$(find_asset "macos.*aarch64.*\\.app\\.tar\\.gz")
WINDOWS_X86_64=$(find_asset "windows.*x86_64.*\\.nsis\\.zip")
WINDOWS_AARCH64=$(find_asset "windows.*arm64.*\\.nsis\\.zip")
LINUX_X86_64=$(find_asset "linux.*x86_64.*\\.AppImage")

PLATFORMS="{}"

add_platform() {
  local key="$1"
  local entry="$2"
  if [ -z "$entry" ]; then
    echo "skip $key (no asset)"
    return
  fi
  local name="${entry%%|*}"
  local sig="${entry#*|}"
  local url="${BASE_URL}/${name}"
  PLATFORMS=$(echo "$PLATFORMS" | jq --arg k "$key" --arg sig "$sig" --arg url "$url" \
    '. + {($k): {signature: $sig, url: $url}}')
}

add_platform "darwin-aarch64" "$DARWIN_AARCH64"
add_platform "windows-x86_64" "$WINDOWS_X86_64"
add_platform "windows-aarch64" "$WINDOWS_AARCH64"
add_platform "linux-x86_64" "$LINUX_X86_64"

jq -n \
  --arg version "$VERSION" \
  --arg notes "PiDanMD ${TAG} - 详细更新内容请见 GitHub Release。" \
  --arg pub_date "$DATE" \
  --argjson platforms "$PLATFORMS" \
  '{version: $version, notes: $notes, pub_date: $pub_date, platforms: $platforms}' \
  > /tmp/latest.json

echo "=== latest.json ==="
cat /tmp/latest.json
echo "==================="

gh release upload "$TAG" /tmp/latest.json --clobber --repo "$REPO"
echo "Uploaded latest.json to release $TAG"
