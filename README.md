# DevTools Hub

[![Release](https://img.shields.io/github/v/tag/lszdeveloping/devtoolshub?label=release)](https://github.com/lszdeveloping/devtoolshub/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-111827)](#platform-support)

DevTools Hub is a Windows desktop installer and manager for developer tools. It helps you provision a development machine with the essentials in one place: version control, runtimes, package managers, editors, CLIs, databases, containers, web server tooling, and system dependencies.

Built with Electron, React, TypeScript, Vite, and Tailwind CSS.

## Highlights

- Desktop interface for discovering and installing developer tools on Windows.
- Parallel tool detection with installed/not-installed status from live registry PATH.
- Hardened Electron shell: `sandbox: true`, Content-Security-Policy, external-navigation guard.
- On-disk installer resolution via `asar.unpacked` — no runtime download from GitHub.
- UAC-elevated install/uninstall with tee-file stdout streaming for progress.
- Per-tool try/catch in install queue — one failure no longer aborts the batch.
- One-click developer profiles for fast environment bootstrap.
- CLI companion (`devtoolshub`) for listing, installing, testing, diagnosing, exporting configs.
- Install logs for troubleshooting failed installs.

## Included Tools

| Category | Examples |
| --- | --- |
| Version control | Git, GitHub Desktop, Git LFS |
| CLI tools | GitHub CLI, Codex CLI, Claude CLI |
| Runtimes | Node.js, Python, Go, Rust, Deno, Bun, Java |
| Package managers | Yarn, Maven, Gradle |
| Editors | VS Code |
| Databases | PostgreSQL, MongoDB, Redis, MySQL, MariaDB, SQL Server Express |
| DevOps | Docker, Docker Compose |
| API testing | Postman |
| Web server stack | WampServer, Apache, PHP, PhpMyAdmin, Adminer, xDebug |
| System libraries | Visual C++ Redistributables |

## Download

Latest build on the [Releases page](https://github.com/lszdeveloping/devtoolshub/releases).

For Windows, download:

```text
DevTools Hub Setup 1.2.0.exe
```

Most installers require administrator permission (system-level tools, PATH updates). The app triggers a UAC prompt as needed.

## Platform Support

| Platform | Status |
| --- | --- |
| Windows 10/11 (x64) | Supported |

Linux and macOS support has been removed. The app enforces Windows-only at startup.

## Development

Install dependencies:

```bash
npm install
```

Run the app in development mode:

```bash
npm run dev
```

Build the renderer, main process, and CLI:

```bash
npm run build
```

Create a distributable build:

```bash
npm run dist
```

Requires Node.js >= 18.

## CLI

After building, the CLI entrypoint is available at:

```text
dist/cli/cli.js
```

Common commands:

```bash
devtoolshub list
devtoolshub install git github-cli
devtoolshub status
devtoolshub diagnose
devtoolshub export-config > devtools-config.json
devtoolshub update <tool>     # winget upgrade
devtoolshub uninstall <tool>  # UAC-elevated
```

## Project Structure

```text
src/
  cli/              Command-line interface
  main/             Electron main process and IPC handlers
  renderer/         React application
  shared/           Shared tool metadata and types
installers/
  windows/          PowerShell installers (asar-unpacked at runtime)
resources/          App icons and packaged assets
```

## Releases

Release builds are written to the `release/` directory.

Windows release assets:

```text
DevTools Hub Setup x.y.z.exe
DevTools Hub Setup x.y.z.exe.blockmap
latest.yml
```

The unpacked build directory and Electron Builder debug files are local build outputs and should not be uploaded as release assets.

## Contributing

Issues and suggestions are welcome through [GitHub Issues](https://github.com/lszdeveloping/devtoolshub/issues).

When adding a new tool, update the shared tool catalog and provide a Windows PowerShell installer script.

## License

MIT
