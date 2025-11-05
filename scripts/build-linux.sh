#!/usr/bin/env bash

# Build executable for Linux x64

set -e

BUILD_DIR="build"
OUTPUT="$BUILD_DIR/tabf1-linux-x64"

echo "🏎️  Building TabF1 for Linux (x64)..."
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
fi

echo "🔨 Compiling for Linux x64..."
NODE_ENV=production bun build ./src/index.tsx \
    --compile \
    --target=bun-linux-x64 \
    --outfile="$OUTPUT" \
    --minify

if [ -f "$OUTPUT" ]; then
    chmod +x "$OUTPUT"
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo ""
    echo "✨ Success! Built: $OUTPUT ($SIZE)"
    echo ""
    echo "Run with: $OUTPUT"
else
    echo "❌ Build failed"
    exit 1
fi
