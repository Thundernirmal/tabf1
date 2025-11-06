# 🔨 Building TabF1 Executables

This guide explains how to build standalone executables for TabF1 using Bun.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Build Scripts](#build-scripts)
- [Platform-Specific Builds](#platform-specific-builds)
- [Automated Builds (GitHub Actions)](#automated-builds-github-actions)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Install Bun

**macOS and Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify installation:
```bash
bun --version
```

### Clone and Setup

```bash
git clone https://github.com/yourusername/tabf1.git
cd tabf1
bun install
```

## Quick Start

Build for your current platform:
```bash
npm run build:exe
# or
bun run build:exe
```

The executable will be created in the `build/` directory.

## Build Scripts

### Using npm/bun scripts

| Command | Description |
|---------|-------------|
| `npm run build:exe` | Build for current platform |
| `npm run build:exe:all` | Build for all platforms |
| `npm run build:exe:linux` | Build for Linux x64 |
| `npm run build:exe:macos` | Build for macOS (Intel + Apple Silicon) |
| `npm run build:exe:windows` | Build for Windows x64 |

### Using shell scripts directly

| Script | Platform | Description |
|--------|----------|-------------|
| `./scripts/build.sh` | Current | Auto-detects platform and builds |
| `./scripts/build-all.sh` | All | Builds for all supported platforms |
| `./scripts/build-linux.sh` | Linux | Builds for Linux x64 only |
| `./scripts/build-macos.sh` | macOS | Builds for both Intel and Apple Silicon |
| `./scripts/build-windows.bat` | Windows | Builds for Windows x64 only |

## Platform-Specific Builds

### Linux (x64)

```bash
./scripts/build-linux.sh
```

Output: `build/tabf1-linux-x64`

**Run:**
```bash
chmod +x build/tabf1-linux-x64
./build/tabf1-linux-x64
```

### macOS (Intel - x64)

```bash
bun build ./src/index.tsx --compile --target=bun-darwin-x64 --outfile=build/tabf1-macos-x64 --minify
```

Output: `build/tabf1-macos-x64`

**Run:**
```bash
chmod +x build/tabf1-macos-x64
./build/tabf1-macos-x64
```

### macOS (Apple Silicon - arm64)

```bash
bun build ./src/index.tsx --compile --target=bun-darwin-arm64 --outfile=build/tabf1-macos-arm64 --minify
```

Output: `build/tabf1-macos-arm64`

**Run:**
```bash
chmod +x build/tabf1-macos-arm64
./build/tabf1-macos-arm64
```

### Windows (x64)

```bash
bun build ./src/index.tsx --compile --target=bun-windows-x64 --outfile=build/tabf1-windows-x64.exe --minify
```

Output: `build/tabf1-windows-x64.exe`

**Run:**
```cmd
.\build\tabf1-windows-x64.exe
```

## Build Options

### Standard Build

```bash
bun build ./src/index.tsx \
  --compile \
  --target=bun-linux-x64 \
  --outfile=build/tabf1-linux-x64 \
  --minify
```

### With Source Maps (for debugging)

```bash
bun build ./src/index.tsx \
  --compile \
  --target=bun-linux-x64 \
  --outfile=build/tabf1-linux-x64 \
  --sourcemap
```

### Without Minification (larger but easier to debug)

```bash
bun build ./src/index.tsx \
  --compile \
  --target=bun-linux-x64 \
  --outfile=build/tabf1-linux-x64
```

## Automated Builds (GitHub Actions)

### Continuous Integration

Every push and PR automatically builds executables for all platforms via `.github/workflows/build.yml`.

**View builds:**
1. Go to the Actions tab on GitHub
2. Select the latest workflow run
3. Download artifacts for each platform

### Creating a Release

To create a new release with pre-built executables:

```bash
# 1. Update version in package.json
npm version 5.1.0

# 2. Create and push a git tag
git tag v5.1.0
git push origin v5.1.0

# 3. GitHub Actions will automatically:
#    - Build executables for all platforms
#    - Create a GitHub release
#    - Attach all executables to the release
```

**Manual release workflow:**
1. Go to Actions > Release
2. Click "Run workflow"
3. Select branch and run

## Troubleshooting

### Issue: "bun: command not found"

**Solution:** Bun is not installed or not in PATH.

```bash
# Reinstall Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (Linux/macOS)
export PATH="$HOME/.bun/bin:$PATH"

# Reload shell
source ~/.bashrc  # or ~/.zshrc
```

### Issue: Build fails with "Module not found"

**Solution:** Dependencies not installed.

```bash
# Clean install
rm -rf node_modules bun.lockb
bun install
```

### Issue: Permission denied when running executable

**Solution:** Make the file executable.

```bash
chmod +x build/tabf1-*
```

### Issue: macOS "cannot be opened because it is from an unidentified developer"

**Solution:** Remove quarantine attribute.

```bash
xattr -d com.apple.quarantine build/tabf1-macos-*
```

Or allow in System Preferences:
1. Open System Preferences → Security & Privacy
2. Click "Open Anyway" next to the blocked app

### Issue: Cross-compilation not working

**Note:** Bun's `--compile` feature requires you to build on the target platform or use GitHub Actions for cross-platform builds.

**Solution:** Use the GitHub Actions workflow or build on the target platform.

## Build Sizes

Expected executable sizes:

- **Linux x64**: ~40-50 MB
- **macOS x64**: ~45-55 MB
- **macOS arm64**: ~40-50 MB
- **Windows x64**: ~45-55 MB

*Sizes include the Bun runtime and all dependencies.*

## Distribution

After building, you can distribute the executables:

1. **Direct Download**: Host on your server or GitHub releases
2. **Package Managers**: Submit to homebrew, apt, etc.
3. **Installers**: Create platform-specific installers (MSI, DMG, DEB)

## Further Reading

- [Bun Compile Documentation](https://bun.sh/docs/bundler/executables)
- [GitHub Actions Workflows](.github/workflows/)
- [Main README](README.md)

---

**Need help?** Open an issue on [GitHub](https://github.com/yourusername/tabf1/issues).
