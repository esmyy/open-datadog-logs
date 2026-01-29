#!/usr/bin/env node

// `clipboardy` and `open` are ESM-first packages; when required from CJS, use `.default`.
const clipboardyModule = require('clipboardy');
const clipboardy = clipboardyModule?.default ?? clipboardyModule;
const openModule = require('open');
const open = openModule?.default ?? openModule;
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const os = require('os');

// Strict UUID: clipboard must be exactly a UUID (not limited to v4). Case-insensitive.
const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let previousClipboard = '';

const PLIST_NAME = 'com.esmyy.open-datadog-logs.plist';
const PLIST_PATH = path.join(os.homedir(), 'Library', 'LaunchAgents', PLIST_NAME);

const readClipboard = () => {
  // Prefer clipboardy, but keep a macOS fallback for launchd environments.
  try {
    return clipboardy.readSync();
  } catch (e) {
    if (os.platform() === 'darwin') {
      try {
        return execSync('/usr/bin/pbpaste', { encoding: 'utf8' });
      } catch (_) {
        // fallthrough
      }
    }
    return '';
  }
};

const openUrl = (url) => {
  try {
    const p = open(url);
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (_) {}
};

// 启动监听功能
const startListening = () => {
  console.log('开始监听剪贴板...');
  setInterval(() => {
    try {
      // Some apps copy with trailing newline/spaces; normalize to improve match reliability.
      const currentClipboard = (readClipboard() || '').trim();
      if (currentClipboard !== previousClipboard) {
        previousClipboard = currentClipboard;
        if (requestIdPattern.test(currentClipboard)) {
          console.log(`检测到请求 ID: ${currentClipboard}`);
          openUrl(`https://us5.datadoghq.com/logs?query=%40id%3A${currentClipboard}`);
        }
      }
    } catch (error) {
      // ignore
    }
  }, 1000);
};

// 添加到启动项的功能 (macOS)
const addToStartup = () => {
  if (os.platform() !== 'darwin') {
    console.log('启动项功能目前仅支持 macOS');
    return;
  }

  // node + script path
  const binPath = process.execPath;
  const scriptPath = __filename;
    
    // 创建 launchd plist 文件
    const launchAgentsDir = path.dirname(PLIST_PATH);

    // 确保 LaunchAgents 目录存在
    if (!fs.existsSync(launchAgentsDir)) {
      fs.mkdirSync(launchAgentsDir, { recursive: true });
    }

    // 确保 Logs 目录存在
    const logsDir = path.join(os.homedir(), 'Library', 'Logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // 创建 plist 内容（macOS 自启动的标准方式就是 launchd plist）
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.esmyy.open-datadog-logs</string>
  <key>ProgramArguments</key>
  <array>
    <string>${binPath}</string>
    <string>${scriptPath}</string>
    <string>start</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${path.join(os.homedir(), 'Library', 'Logs', 'open-datadog-logs.log')}</string>
  <key>StandardErrorPath</key>
  <string>${path.join(os.homedir(), 'Library', 'Logs', 'open-datadog-logs.error.log')}</string>
</dict>
</plist>`;

    // 写入 plist 文件
    fs.writeFileSync(PLIST_PATH, plistContent, 'utf8');

  // 加载 launchd 服务（简单处理：卸载再加载）
  exec(`launchctl unload ${PLIST_PATH} 2>/dev/null; launchctl load ${PLIST_PATH}`, (error) => {
    if (error) {
      console.error(`添加到启动项失败: ${error.message}`);
      console.log('请手动运行: launchctl load ' + PLIST_PATH);
      return;
    }
    console.log('✓ 已成功添加到启动项！');
    console.log('✓ 服务将在系统启动时自动运行');
  });
};

// 停止监听（停止 launchd 服务，但保留启动项文件）
const stopListening = () => {
  if (os.platform() !== 'darwin') {
    console.log('停止监听功能目前仅支持 macOS（launchd）');
    return;
  }
  if (!fs.existsSync(PLIST_PATH)) {
    console.log('未找到启动项文件，无需停止：' + PLIST_PATH);
    return;
  }
  exec(`launchctl unload ${PLIST_PATH}`, (error) => {
    if (error) {
      console.error(`停止监听失败: ${error.message}`);
      return;
    }
    console.log('✓ 已停止监听');
  });
};

// 移除自启动（停止 launchd + 删除 plist）
const removeFromStartup = () => {
  if (os.platform() !== 'darwin') {
    console.log('移除启动项功能目前仅支持 macOS');
    return;
  }
  exec(`launchctl unload ${PLIST_PATH} 2>/dev/null || true`, () => {
    if (fs.existsSync(PLIST_PATH)) {
      fs.rmSync(PLIST_PATH);
    }
    console.log('✓ 已移除启动项');
  });
};

// 解析命令行参数
const args = process.argv.slice(2);
if (args[0] === 'start') {
  startListening();
} else if (args[0] === 'add-to-startup') {
  addToStartup();
} else if (args[0] === 'stop') {
  stopListening();
} else if (args[0] === 'remove-from-startup') {
  removeFromStartup();
} else {
  // 如果没有参数，默认启动监听
  startListening();
}