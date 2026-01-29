#!/usr/bin/env node

const clipboardy = require('clipboardy');
const open = require('open');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');

// Match a generic UUID (not limited to v4). Case-insensitive to accept uppercase hex too.
const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
let previousClipboard = '';

// 启动监听功能
const startListening = () => {
  console.log('开始监听剪贴板...');
  setInterval(() => {
    try {
      const currentClipboard = clipboardy.readSync();
      if (currentClipboard !== previousClipboard) {
        previousClipboard = currentClipboard;
        if (requestIdPattern.test(currentClipboard)) {
          console.log(`检测到请求 ID: ${previousClipboard}`);
          open(`https://us5.datadoghq.com/logs?query=%40id%3A${previousClipboard}`);
        }
      }
    } catch (error) {
      // 忽略剪贴板读取错误
    }
  }, 1000);
};

// 添加到启动项的功能 (macOS)
const addToStartup = () => {
  if (os.platform() !== 'darwin') {
    console.log('启动项功能目前仅支持 macOS');
    return;
  }

  // 获取可执行文件的路径
  // 优先使用全局安装的 bin 路径，如果没有则使用当前脚本路径
  let scriptPath = __filename;
  
  // 尝试找到全局安装的 bin 路径
  exec('which open-datadog-logs', (error, stdout) => {
    if (!error && stdout) {
      scriptPath = stdout.trim();
    }
    
    // 如果 scriptPath 是符号链接，获取真实路径
    try {
      if (fs.existsSync(scriptPath)) {
        const realPath = fs.realpathSync(scriptPath);
        scriptPath = realPath;
      }
    } catch (e) {
      // 忽略错误，使用原路径
    }

    const binPath = process.argv[0]; // node 路径
    
    // 创建 launchd plist 文件
    const plistName = 'com.esmyy.open-datadog-logs.plist';
    const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', plistName);
    const launchAgentsDir = path.dirname(plistPath);

    // 确保 LaunchAgents 目录存在
    if (!fs.existsSync(launchAgentsDir)) {
      fs.mkdirSync(launchAgentsDir, { recursive: true });
    }

    // 确保 Logs 目录存在
    const logsDir = path.join(os.homedir(), 'Library', 'Logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // 创建 plist 内容
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
    fs.writeFileSync(plistPath, plistContent, 'utf8');

    // 加载 launchd 服务
    exec(`launchctl load ${plistPath}`, (error) => {
      if (error) {
        // 如果已经加载过，先卸载再加载
        exec(`launchctl unload ${plistPath} 2>/dev/null; launchctl load ${plistPath}`, (error2) => {
          if (error2) {
            console.error(`添加到启动项失败: ${error2.message}`);
            console.log('请手动运行: launchctl load ' + plistPath);
          } else {
            console.log('✓ 已成功添加到启动项！');
            console.log('✓ 服务将在系统启动时自动运行');
          }
        });
      } else {
        console.log('✓ 已成功添加到启动项！');
        console.log('✓ 服务将在系统启动时自动运行');
      }
    });
  });
};

// 解析命令行参数
const args = process.argv.slice(2);
if (args[0] === 'start') {
  startListening();
} else if (args[0] === 'add-to-startup') {
  addToStartup();
} else {
  // 如果没有参数，默认启动监听
  startListening();
}