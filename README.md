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

**After installation (macOS), it's ready to use**: it will automatically add itself to system startup (launchd) and start listening to your clipboard.

Just **copy a UUID** (the clipboard content must be exactly the UUID), and it will automatically open the corresponding Datadog Logs page.

### Using pnpm

```bash
pnpm add -g @esmyy/open-datadog-logs
```

**After installation (macOS), it's ready to use**: it will automatically add itself to system startup (launchd) and start listening to your clipboard.

Just **copy a UUID** (the clipboard content must be exactly the UUID), and it will automatically open the corresponding Datadog Logs page.

### From source

```bash
git clone https://github.com/esmyy/open-datadog-logs.git
cd open-datadog-logs
pnpm install
```

After installation, it will automatically add itself to system startup (macOS).

## Usage

After installation on macOS, it will start listening to your clipboard by default. All commands:

| Command | Effect | Notes |
|---|---|---|
| `open-datadog-logs` | Start listening in foreground | Keep this terminal open |
| `open-datadog-logs start` | Start listening in foreground | Same as above |
| `open-datadog-logs add-to-startup` | Enable auto-start on macOS (launchd) | Creates/loads `~/Library/LaunchAgents/com.esmyy.open-datadog-logs.plist` |
| `open-datadog-logs stop` | Stop the launchd listener | Keeps the plist file |
| `open-datadog-logs remove-from-startup` | Disable auto-start | Unloads launchd + deletes the plist file |

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

