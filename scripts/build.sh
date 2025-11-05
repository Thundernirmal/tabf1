#!/usr/bin/env bash

# Build single executable for current platform using Bun

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build directory
BUILD_DIR="build"

echo -e "${BLUE}🏎️  TabF1 - Building Executable${NC}"
echo ""

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Error: Bun is not installed${NC}"
    echo -e "${YELLOW}Please install Bun first: https://bun.sh${NC}"
    echo -e "${YELLOW}Run: curl -fsSL https://bun.sh/install | bash${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Bun version: $(bun --version)${NC}"

# Detect platform
OS=$(uname -s)
ARCH=$(uname -m)

case "$OS" in
    Linux*)
        PLATFORM="linux-x64"
        OUTPUT="$BUILD_DIR/tabf1-linux-x64"
        TARGET="bun-linux-x64"
        ;;
    Darwin*)
        if [ "$ARCH" = "arm64" ]; then
            PLATFORM="darwin-arm64"
            OUTPUT="$BUILD_DIR/tabf1-macos-arm64"
            TARGET="bun-darwin-arm64"
        else
            PLATFORM="darwin-x64"
            OUTPUT="$BUILD_DIR/tabf1-macos-x64"
            TARGET="bun-darwin-x64"
        fi
        ;;
    MINGW*|MSYS*|CYGWIN*)
        PLATFORM="windows-x64"
        OUTPUT="$BUILD_DIR/tabf1-windows-x64.exe"
        TARGET="bun-windows-x64"
        ;;
    *)
        echo -e "${RED}❌ Unsupported platform: $OS${NC}"
        exit 1
        ;;
esac

echo -e "${BLUE}Platform detected: ${YELLOW}$PLATFORM${NC}"
echo ""

# Clean and create build directory
mkdir -p "$BUILD_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    bun install
    echo ""
fi

# Build executable
echo -e "${YELLOW}🔨 Compiling executable...${NC}"
NODE_ENV=production bun build ./src/index.tsx \
    --compile \
    --target="$TARGET" \
    --outfile="$OUTPUT" \
    --minify

echo ""

# Check if build was successful
if [ -f "$OUTPUT" ]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo -e "${GREEN}✨ Success!${NC}"
    echo -e "${GREEN}Executable created: ${YELLOW}$OUTPUT${NC} ${BLUE}($SIZE)${NC}"
    echo ""
    echo -e "${BLUE}Run with:${NC}"
    echo -e "  ${GREEN}$OUTPUT${NC}"
    echo ""
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
