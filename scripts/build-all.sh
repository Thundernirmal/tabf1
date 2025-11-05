#!/usr/bin/env bash

# Build single executable using Bun
# This script compiles the TabF1 app into standalone executables for multiple platforms

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build directory
BUILD_DIR="build"
DIST_DIR="dist"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TabF1 - Executable Builder (Bun)     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Error: Bun is not installed${NC}"
    echo -e "${YELLOW}Please install Bun first: https://bun.sh${NC}"
    echo -e "${YELLOW}Run: curl -fsSL https://bun.sh/install | bash${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Bun found: $(bun --version)${NC}"
echo ""

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    bun install
fi

# Build TypeScript to JavaScript first (optional, for debugging)
echo -e "${YELLOW}🔨 Building TypeScript...${NC}"
bun run build

echo ""
echo -e "${BLUE}Building executables for all platforms...${NC}"
echo ""

# Platform detection for naming
PLATFORMS=("linux-x64" "darwin-x64" "darwin-arm64" "windows-x64")
PLATFORM_NAMES=("Linux (x64)" "macOS (Intel)" "macOS (Apple Silicon)" "Windows (x64)")

# Build for all platforms
for i in "${!PLATFORMS[@]}"; do
    PLATFORM="${PLATFORMS[$i]}"
    PLATFORM_NAME="${PLATFORM_NAMES[$i]}"

    echo -e "${YELLOW}Building for ${PLATFORM_NAME}...${NC}"

    case "$PLATFORM" in
        linux-x64)
            OUTPUT="$BUILD_DIR/tabf1-linux-x64"
            bun build ./src/index.tsx \
                --compile \
                --target=bun-linux-x64 \
                --outfile="$OUTPUT"
            ;;
        darwin-x64)
            OUTPUT="$BUILD_DIR/tabf1-macos-x64"
            bun build ./src/index.tsx \
                --compile \
                --target=bun-darwin-x64 \
                --outfile="$OUTPUT"
            ;;
        darwin-arm64)
            OUTPUT="$BUILD_DIR/tabf1-macos-arm64"
            bun build ./src/index.tsx \
                --compile \
                --target=bun-darwin-arm64 \
                --outfile="$OUTPUT"
            ;;
        windows-x64)
            OUTPUT="$BUILD_DIR/tabf1-windows-x64.exe"
            bun build ./src/index.tsx \
                --compile \
                --target=bun-windows-x64 \
                --outfile="$OUTPUT"
            ;;
    esac

    if [ -f "$OUTPUT" ]; then
        SIZE=$(du -h "$OUTPUT" | cut -f1)
        echo -e "${GREEN}  ✓ Built: $OUTPUT ($SIZE)${NC}"
    else
        echo -e "${RED}  ✗ Failed to build: $OUTPUT${NC}"
    fi
    echo ""
done

# Summary
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Build Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Executables created in ${BUILD_DIR}/:${NC}"
ls -lh "$BUILD_DIR"/ 2>/dev/null || echo "No executables found"
echo ""
echo -e "${BLUE}Usage:${NC}"
echo -e "  ${GREEN}./build/tabf1-linux-x64${NC}       (Linux)"
echo -e "  ${GREEN}./build/tabf1-macos-x64${NC}       (macOS Intel)"
echo -e "  ${GREEN}./build/tabf1-macos-arm64${NC}     (macOS Apple Silicon)"
echo -e "  ${GREEN}.\\build\\tabf1-windows-x64.exe${NC} (Windows)"
echo ""
echo -e "${YELLOW}Tip: You can move these executables anywhere and run them standalone!${NC}"
