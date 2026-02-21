---
title: "nx-electron Packaging and Distribution"
source:
  - url: "https://github.com/bennymeg/nx-electron/blob/master/docs/packaging.md"
    title: "nx-electron Packaging Documentation"
  - url: "https://github.com/bennymeg/nx-electron"
    title: "nx-electron GitHub README"
  - url: "https://github.com/bennymeg/nx-electron/blob/master/packages/nx-electron/src/validation/maker.schema.json"
    title: "nx-electron maker.schema.json"
  - url: "https://github.com/bennymeg/nx-electron/blob/master/docs/migration/migrating.v10.md"
    title: "nx-electron v10 Migration Guide"
  - url: "https://www.electron.build/"
    title: "electron-builder"
  - url: "https://www.electron.build/configuration"
    title: "electron-builder Common Configuration"
  - url: "https://www.electron.build/cli.html"
    title: "electron-builder CLI"
  - url: "https://www.electron.build/win.html"
    title: "electron-builder Windows Targets"
  - url: "https://www.electron.build/mac.html"
    title: "electron-builder macOS Targets"
  - url: "https://www.electron.build/linux.html"
    title: "electron-builder Linux Targets"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx-electron, packaging, electron-builder, distribution]
---

# nx-electron Packaging and Distribution

## Overview

nx-electron provides two executors for distributing Electron applications: `package` (which creates an unpacked distributable directory) and `make` (which produces a platform-specific installer or executable). Both executors delegate to [electron-builder](https://www.electron.build/) under the hood and can be configured either via CLI flags or a static `maker.options.json` file that lives in the app source tree.

## Package vs Make

The two distribution executors serve distinct purposes:

| Executor | Command | Output | Use case |
|---|---|---|---|
| `package` | `nx run <app>:package` | Unpacked directory at `dist/packages` | Testing distribution without creating an installer |
| `make` | `nx run <app>:make` | Platform installer/executable at `dist/executables` | Producing a final distributable for end users |

Running `nx run <app>:make --prepackageOnly` is equivalent to running the `package` executor — it stops electron-builder after the staging step and skips installer creation.

## Build Before Package

Both executors require that the frontend and Electron apps are already built. The recommended sequence is:

```bash
# 1. Build the frontend
nx build <frontend-app>

# 2. Build the Electron main process
nx build <electron-app>

# 3. Package or make
nx run <electron-app>:package
# or
nx run <electron-app>:make
```

Skipping the build steps results in stale or missing output files being packaged.

## Package Executor

The `package` executor produces an unpacked application directory suitable for inspection and local testing. Its output lands in `dist/packages` by default (changed from `out` in v10).

```bash
nx run <electron-app>:package [options]
```

Key CLI options:

| Option | Description |
|---|---|
| `--outputPath` | Override the output directory (default: `dist/packages`) |
| `--platform` | Target platform: `linux`, `mac`, or `win` |
| `--arch` | Target architecture: `x64`, `ia32`, `armv7l`, `arm64`, `universal` |
| `--publishPolicy` | Publish policy: `onTag`, `onTagOrDraft`, `always`, or `never` (renamed from `publish` in v22) |
| `--prepackageOnly` | Stop after staging — do not create an installer |

## Make Executor

The `make` executor produces a platform-specific installer or self-contained executable. Its output lands in `dist/executables` by default (changed from `out` in v10).

```bash
nx run <electron-app>:make [options]
```

The make executor accepts the same CLI options as the package executor. The `--prepackageOnly` flag reduces it to the equivalent of the `package` executor.

### Important: publishPolicy Rename

In nx-electron 22, the CLI parameter `--publish` was renamed to `--publishPolicy`. Use the new name in `project.json` targets and on the command line:

```bash
# nx-electron 22 and later
nx run <electron-app>:make --publishPolicy=always

# NOT this (deprecated before v22)
# nx run <electron-app>:make --publish=always
```

## maker.options.json

Static packaging configuration lives at:

```
apps/<electron-app>/src/app/options/maker.options.json
```

Options in this file override any flags passed on the command line or selected via the Nx console. The file must validate against the nx-electron maker schema at:

```
node_modules/nx-electron/src/validation/maker.schema.json
```

Minimal example pointing to the schema:

```json
{
  "$schema": "../../../../../node_modules/nx-electron/src/validation/maker.schema.json",
  "productName": "My App",
  "copyright": "Copyright © 2026 My Company",
  "asar": true,
  "compression": "normal",
  "directories": {
    "buildResources": "assets"
  },
  "win": {
    "target": [
      { "target": "nsis", "arch": ["x64", "ia32"] }
    ],
    "icon": "assets/icon.ico"
  },
  "mac": {
    "target": [
      { "target": "dmg", "arch": ["universal"] }
    ],
    "icon": "assets/icon.icns"
  },
  "linux": {
    "target": [
      { "target": "AppImage", "arch": ["x64"] }
    ],
    "category": "Utility"
  }
}
```

## electron-builder Configuration

nx-electron uses electron-builder as the underlying packaging engine. The top-level options in `maker.options.json` map directly to the [electron-builder common configuration](https://www.electron.build/configuration).

### Core Identity

| Field | Description | Default |
|---|---|---|
| `appId` | Bundle identifier (macOS CFBundleIdentifier, Windows AUMID) | `com.electron.${name}` |
| `productName` | Display name (may contain spaces) | `name` from package.json |
| `copyright` | Copyright string shown in OS metadata | — |

### File Inclusion

| Field | Description |
|---|---|
| `files` | Glob patterns for files to include in the package |
| `extraFiles` | Additional files copied to the app content directory |
| `extraResources` | Additional files copied to the `resources/` directory |

### Packaging Options

| Field | Description | Default |
|---|---|---|
| `asar` | Pack source into an Electron ASAR archive | `true` |
| `asar.smartUnpack` | Auto-unpack native modules from the archive | `true` |
| `compression` | ASAR compression level: `store`, `normal`, `maximum` | `normal` |
| `npmRebuild` | Rebuild native modules for the packaged Electron version | `true` |
| `electronCompile` | Use `electron-compile` for TypeScript/CoffeeScript source | `false` |

### Code Signing

| Field | Description |
|---|---|
| `forceCodeSigning` | Fail the build if code signing is not successful |
| `cscLink` | Path or URL to the signing certificate |
| `cscKeyPassword` | Password for the signing certificate |

## Platform-Specific Notes

### Windows

Default target format is **NSIS** (installer wizard). Supported targets:

- `nsis` — Standard installer wizard
- `nsis-web` — Web installer (downloads during installation)
- `portable` — Standalone executable, no installation required
- `appx` — Microsoft Store package (Windows 10+)
- `msi` — Windows Installer package
- `squirrel` — Squirrel.Windows auto-updater format

Example NSIS configuration:

```json
"win": {
  "target": [
    { "target": "nsis", "arch": ["x64"] },
    { "target": "portable", "arch": ["x64"] }
  ],
  "icon": "assets/icon.ico",
  "requestedExecutionLevel": "asInvoker"
}
```

Code signing on Windows uses `signtoolOptions` (for local certificate stores or PFX files) or `azureSignOptions` (for Azure Trusted Signing).

### macOS

Default target format is **DMG**. Supported targets:

- `dmg` — Disk image with drag-to-Applications installation
- `pkg` — macOS native package installer
- `mas` — Mac App Store submission bundle
- `mas-dev` — Development variant of the MAS build

Example DMG configuration:

```json
"mac": {
  "target": [
    { "target": "dmg", "arch": ["universal"] }
  ],
  "icon": "assets/icon.icns",
  "hardenedRuntime": true,
  "entitlements": "assets/entitlements.mac.plist",
  "entitlementsInherit": "assets/entitlements.mac.inherit.plist"
}
```

macOS builds require notarization for distribution outside the App Store. electron-builder handles notarization automatically when Apple ID credentials are provided.

### Linux

Default target format is **AppImage**. Supported targets:

- `AppImage` — Portable single-file executable, no installation required
- `deb` — Debian/Ubuntu package
- `rpm` — Red Hat/Fedora package
- `snap` — Snap store package
- `flatpak` — Flatpak bundle
- `pacman` — Arch Linux package

Example AppImage + deb configuration:

```json
"linux": {
  "target": [
    { "target": "AppImage", "arch": ["x64"] },
    { "target": "deb", "arch": ["x64"] }
  ],
  "icon": "assets/icons",
  "category": "Utility",
  "maintainer": "My Company <support@mycompany.com>"
}
```

The `icon` field for Linux should point to a directory containing PNG files sized at 16x16, 32x32, 48x48, 64x64, 128x128, and 256x256 pixels.

## project.json Target Configuration

Executor options can be set statically in `project.json` to avoid repeating them on the command line:

```json
{
  "targets": {
    "package": {
      "executor": "nx-electron:package",
      "options": {
        "outputPath": "dist/packages",
        "platform": "win",
        "arch": "x64"
      }
    },
    "make": {
      "executor": "nx-electron:make",
      "options": {
        "outputPath": "dist/executables",
        "publishPolicy": "never"
      }
    }
  }
}
```

Options set in `maker.options.json` take precedence over both `project.json` options and CLI flags.
