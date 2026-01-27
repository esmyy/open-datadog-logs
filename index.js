#!/usr/bin/env node

const clipboardy = require('clipboardy');
const open = require('open');
const clipboardy = require('clipboardy');
const open = require('open');
const path = require('path');
const { exec } = require('child_process');

const requestIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/
let previousClipboard = '';

setInterval(() => {
  const currentClipboard = clipboardy.readSync();
  if (currentClipboard !== previousClipboard) {
    previousClipboard = currentClipboard;
    if (requestIdPattern.test(currentClipboard)) {
      open(`https://us5.datadoghq.com/logs?query=%40id%3A${previousClipboard}`);
    }
  }
}, 1000);


// 添加到启动项的功能
const addToStartup = () => {
  const appName = "Clipboard Listener";
  const appPath = path.join(process.env.HOME, `${appName}.app`);

  // 创建 Automator 应用程序
  const appleScript = `
  tell application "Automator"
      set newDoc to make new document with properties {document type:application}
      tell newDoc
          make new action at end of actions with properties {class:run shell script, script:"/usr/local/bin/clipboard-listener"}
      end tell
      save newDoc in "${appPath}"
  end tell
  `;

  exec(`osascript -e '${appleScript}'`, (error) => {
      if (error) {
          console.error(`Error creating Automator app: ${error}`);
          return;
      }
      console.log(`${appName} 已成功添加到启动项！`);
  });
};

// 解析命令行参数
const args = process.argv.slice(2);
if (args[0] === 'start') {
  startListening();
} else if (args[0] === 'add-to-startup') {
  addToStartup();
} else {
  console.log('使用方法:');
  console.log('  clipboard-listener start      启动监听');
  console.log('  clipboard-listener add-to-startup  添加到启动项');
}