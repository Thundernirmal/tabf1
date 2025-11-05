#!/usr/bin/env bash

# Build executables for macOS (both Intel and Apple Silicon)

set -e

BUILD_DIR="build"

echo "🏎️  Building TabF1 for macOS..."
echo ""

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Error: Bun is not installed"
    echo "Install: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

mkdir -p "$BUILD_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
    echo ""
fi

# Build for Intel (x64)
echo "🔨 Compiling for macOS Intel (x64)..."
NODE_ENV=production bun build ./src/index.tsx \
    --compile \
    --target=bun-darwin-x64 \
    --outfile="$BUILD_DIR/tabf1-macos-x64" \
    --minify

if [ -f "$BUILD_DIR/tabf1-macos-x64" ]; then
    chmod +x "$BUILD_DIR/tabf1-macos-x64"
    SIZE=$(du -h "$BUILD_DIR/tabf1-macos-x64" | cut -f1)
    echo "  ✓ Intel build: $BUILD_DIR/tabf1-macos-x64 ($SIZE)"
fi

echo ""

# Build for Apple Silicon (arm64)
echo "🔨 Compiling for macOS Apple Silicon (arm64)..."
NODE_ENV=production bun build ./src/index.tsx \
    --compile \
    --target=bun-darwin-arm64 \
    --outfile="$BUILD_DIR/tabf1-macos-arm64" \
    --minify

if [ -f "$BUILD_DIR/tabf1-macos-arm64" ]; then
    chmod +x "$BUILD_DIR/tabf1-macos-arm64"
    SIZE=$(du -h "$BUILD_DIR/tabf1-macos-arm64" | cut -f1)
    echo "  ✓ Apple Silicon build: $BUILD_DIR/tabf1-macos-arm64 ($SIZE)"
fi

echo ""
echo "✨ macOS builds complete!"
echo ""
echo "Run with:"
echo "  Intel Mac:    $BUILD_DIR/tabf1-macos-x64"
echo "  Apple Silicon: $BUILD_DIR/tabf1-macos-arm64"
