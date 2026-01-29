# Open Datadog Logs

A CLI tool that automatically opens Datadog logs in your browser when a request ID is copied to the clipboard.

## Description

This tool continuously monitors your clipboard and automatically opens the Datadog logs page in your browser whenever it detects a valid request ID (UUID format) has been copied.

## Features

- 🔍 Automatically detects Datadog request IDs in clipboard
- 🌐 Opens Datadog logs page in browser automatically
- 🚀 Can be added to system startup (macOS)
- ⚡ Lightweight and fast

## Installation

### Using npm

```bash
npm install -g @esmyy/open-datadog-logs
```

安装完成后，工具会自动添加到系统启动项（macOS），下次开机时会自动启动。

### Using pnpm

```bash
pnpm add -g @esmyy/open-datadog-logs
```

安装完成后，工具会自动添加到系统启动项（macOS），下次开机时会自动启动。

### From source

```bash
git clone https://github.com/esmyy/open-datadog-logs.git
cd open-datadog-logs
pnpm install
```

安装完成后会自动添加到启动项。

## Usage

### Start listening

```bash
open-datadog-logs start
```

或者直接运行（默认启动监听）：

```bash
open-datadog-logs
```

This will start monitoring your clipboard. When you copy a request ID (UUID format, clipboard content should be exactly the UUID), it will automatically open the Datadog logs page in your browser.

### Add to startup (macOS)

安装时会自动添加到启动项。如果需要手动添加：

```bash
open-datadog-logs add-to-startup
```

### Remove from startup (macOS)

如果需要从启动项中移除：

```bash
launchctl unload ~/Library/LaunchAgents/com.esmyy.open-datadog-logs.plist
rm ~/Library/LaunchAgents/com.esmyy.open-datadog-logs.plist
```

## How it works

1. The tool monitors your clipboard every second
2. When clipboard content changes, it checks if the content matches a UUID pattern
3. If a valid request ID is detected, it opens `https://us5.datadoghq.com/logs?query=@id:{requestId}` in your default browser

## Request ID Format

The tool recognizes UUID format (clipboard content should be exactly the UUID):
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Where:
- `x` is any hexadecimal digit

## Configuration

Currently, the tool is configured to use the US5 Datadog region (`us5.datadoghq.com`). To change the Datadog region, modify the URL in `index.js`.

## Requirements

- Node.js
- macOS, Linux, or Windows

## Dependencies

- [clipboardy](https://github.com/sindresorhus/clipboardy) - Cross-platform clipboard access
- [open](https://github.com/sindresorhus/open) - Open URLs in the browser

## License

MIT

## Author

esmyy

## Repository

https://github.com/esmyy/open-datadog-logs

