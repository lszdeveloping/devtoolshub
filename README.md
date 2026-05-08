# DevTools Hub

[![Release](https://img.shields.io/github/v/release/lszdeveloping/devtoolshub?label=release)](https://github.com/lszdeveloping/devtoolshub/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-111827)](#platform-support)

DevTools Hub is a desktop installer and manager for developer tools. It helps you set up a development machine with the essentials in one place: version control, runtimes, package managers, editors, CLIs, databases, containers, web server tooling, and system dependencies.

The project is built with Electron, React, TypeScript, Vite, and Tailwind CSS.

## Highlights

- Desktop interface for discovering and installing developer tools.
- Tool detection with installed/not installed status.
- Cross-platform installer scripts for Windows, macOS, and Linux.
- CLI companion for listing, installing, testing, diagnosing, and exporting tool configs.
- Install logs for troubleshooting failed installs.
- Export/import friendly configuration model for repeatable setup.

## Included Tools

DevTools Hub currently includes installers for:

| Category | Examples |
| --- | --- |
| Version control | Git, GitHub Desktop, Git LFS |
| CLI tools | GitHub CLI, Codex CLI, Claude CLI |
| Runtimes | Node.js, Python, Go, Rust, Deno, Bun, Java |
| Package managers | Yarn, Maven, Gradle, Homebrew |
| Editors | VSCode |
| Databases | PostgreSQL, MongoDB, Redis, MySQL, MariaDB, SQL Server Express |
| DevOps | Docker, Docker Compose |
| API testing | Postman |
| Web server stack | WampServer, Apache, PHP, PhpMyAdmin, Adminer, xDebug |
| System libraries | Visual C++ Redistributables |

## Download

The latest public build is available on the [Releases page](https://github.com/lszdeveloping/devtoolshub/releases).

For Windows, download:

```text
DevTools Hub Setup 1.0.0.exe
```

Some installers may require administrator permission because they install system-level tools or update PATH.

## Platform Support

| Platform | Status |
| --- | --- |
| Windows | Supported |
| macOS | Installer scripts included |
| Linux | Installer scripts included |

The desktop package currently targets Windows through Electron Builder's NSIS installer. macOS and Linux scripts are present in the repository and can be packaged as release targets later.

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
```

## Project Structure

```text
src/
  cli/              Command-line interface
  main/             Electron main process and IPC handlers
  renderer/         React application
  shared/           Shared tool metadata and types
installers/
  windows/          PowerShell installers
  macos/            Shell installers
  linux/            Shell installers
resources/          App icons and packaged assets
```

## Releases

Release builds are generated into the `release/` directory.

Recommended assets for a Windows release:

```text
DevTools Hub Setup x.y.z.exe
DevTools Hub Setup x.y.z.exe.blockmap
latest.yml
```

The unpacked build directory and Electron Builder debug files are local build outputs and should not be uploaded as release assets.

## Contributing

Issues and suggestions are welcome through [GitHub Issues](https://github.com/lszdeveloping/devtoolshub/issues).

When adding a new tool, update the shared tool catalog and provide installer scripts for every supported platform where possible.

## License

MIT
