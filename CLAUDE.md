# 🤖 Claude AI Assistant Guide for TabF1

This document provides comprehensive instructions for Claude AI assistants working on the TabF1 project.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Common Tasks](#common-tasks)
- [Code Standards](#code-standards)
- [UI/UX Considerations](#uiux-considerations)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)
- [Git Workflow](#git-workflow)

---

## 📊 Project Overview

**TabF1** is a Formula 1 terminal dashboard application that displays live F1 standings, race results, and detailed driver/constructor performance data.

**Purpose:**
- View current season driver and constructor standings
- Browse race calendar and results
- Examine detailed performance history for drivers and teams
- All in a beautiful, interactive terminal UI

**Key Features:**
- Real-time data from Ergast F1 API
- Intelligent caching system
- Keyboard-driven navigation (vim-like bindings)
- Tokyo Night color theme
- Standalone executable builds for all platforms

---

## 🛠 Technology Stack

### Core Technologies
- **Language:** TypeScript 5.7 (strict mode)
- **Runtime:** Node.js 18+ / Bun
- **UI Framework:** Ink 5.0 (React for CLIs)
- **React Version:** 18.3.1

### Key Dependencies
- **ink** - Terminal UI framework based on React
- **ink-spinner** - Loading indicators
- **react** - UI library
- **zustand** - State management
- **chalk** - Terminal colors
- **date-fns** - Date formatting

### Build Tools
- **TypeScript Compiler** - Type checking and transpilation
- **Bun** - Executable compilation
- **GitHub Actions** - CI/CD automation

### External APIs
- **Ergast F1 API** - `http://api.jolpi.ca/ergast/f1/`
  - Driver standings
  - Constructor standings
  - Race results
  - Historical data

---

## 📁 Project Structure

```
tabf1/
├── src/
│   ├── api/
│   │   └── f1-client.ts          # API client with caching
│   ├── components/
│   │   ├── ErrorMessage.tsx      # Error display
│   │   ├── Header.tsx            # App header
│   │   ├── KeyBindings.tsx       # Keyboard shortcuts display
│   │   ├── Loading.tsx           # Loading spinner
│   │   ├── RaceList.tsx          # Race calendar table
│   │   └── StandingsTable.tsx    # Driver/Constructor tables
│   ├── hooks/
│   │   └── useAppStore.ts        # Zustand global state
│   ├── screens/
│   │   ├── ConstructorDetail.tsx # Constructor detail view
│   │   ├── Dashboard.tsx         # Main standings view
│   │   ├── DriverDetail.tsx      # Driver detail view
│   │   ├── RaceDetail.tsx        # Race results view
│   │   └── Races.tsx             # Race calendar view
│   ├── themes/
│   │   └── tokyo-night.ts        # Colors and styling
│   ├── types/
│   │   └── f1.ts                 # TypeScript type definitions
│   ├── utils/
│   │   └── formatters.ts         # Data formatting utilities
│   ├── App.tsx                   # Root app component
│   └── index.tsx                 # Entry point
├── scripts/
│   ├── build.sh                  # Build for current platform
│   ├── build-all.sh              # Build all platforms
│   ├── build-linux.sh            # Linux build
│   ├── build-macos.sh            # macOS builds
│   └── build-windows.bat         # Windows build
├── .github/workflows/
│   ├── build.yml                 # CI build workflow
│   └── release.yml               # Release automation
├── dist/                         # Compiled JavaScript
├── build/                        # Standalone executables
├── f1_cache.json                 # API response cache
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── BUILD.md                      # Build documentation
├── README.md                     # User documentation
├── CLAUDE.md                     # This file
└── AGENTS.md                     # Agent instructions
```

---

## 💻 Development Workflow

### Initial Setup

```bash
# Install dependencies
npm install
# or
bun install

# Type check
npm run typecheck

# Run in development mode
npm run dev
```

### Development Commands

```bash
# Development with hot reload
npm run dev

# Type checking only
npm run typecheck

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Clean build artifacts
npm run clean

# Build standalone executable
npm run build:exe
```

### File Modification Workflow

1. **Read before Edit** - Always use the Read tool before modifying files
2. **Type Check** - Run `npm run typecheck` after changes
3. **Test Locally** - Use `npm run dev` to test changes
4. **Build Test** - Verify `npm run build` succeeds
5. **Commit** - Create clear, descriptive commit messages

---

## 🎯 Common Tasks

### Adding a New Screen

1. Create screen file in `src/screens/NewScreen.tsx`
2. Add screen type to `src/types/f1.ts`
3. Add navigation method to `src/hooks/useAppStore.ts`
4. Add route in `src/App.tsx`
5. Implement with memoization and useCallback

Example:
```typescript
import React, { useCallback, useMemo } from 'react';
import { useInput } from 'ink';

export const NewScreen: React.FC = () => {
  useInput(useCallback((input, key) => {
    // Handle input
  }, [/* dependencies */]));

  return (/* JSX */);
};
```

### Adding a New Component

1. Create in `src/components/ComponentName.tsx`
2. Wrap with `React.memo` for optimization
3. Add `displayName` for debugging
4. Use proper TypeScript types

Example:
```typescript
import React from 'react';

interface Props {
  data: string;
}

export const Component = React.memo<Props>(({ data }) => {
  return (/* JSX */);
});

Component.displayName = 'Component';
```

### Modifying API Calls

1. Edit `src/api/f1-client.ts`
2. Update types in `src/types/f1.ts`
3. Consider cache expiration times
4. Handle errors gracefully

### Adding New Themes/Colors

1. Edit `src/themes/tokyo-night.ts`
2. Use chalk for terminal colors
3. Test in different terminal emulators
4. Consider accessibility

---

## 📐 Code Standards

### TypeScript

- **Strict mode enabled** - All type errors must be fixed
- **Explicit types** - Avoid `any`, use proper types
- **Import extensions** - Always use `.js` extension for imports
- **No unused variables** - Clean up unused code

### React/Ink

- **Functional components** - No class components
- **Hooks** - Use React hooks properly
- **Memoization** - Use React.memo, useCallback, useMemo
- **No inline objects/arrays** - Extract to constants

### Performance

- **Prevent re-renders** - Use memoization extensively
- **Callback dependencies** - Always specify complete dependency arrays
- **Static data** - Move constants outside components
- **ANSI code handling** - Strip ANSI codes when calculating lengths

### File Organization

- **One component per file** - Clear file structure
- **Named exports** - For components and utilities
- **Type co-location** - Types near usage
- **Clear naming** - Descriptive, consistent names

---

## 🎨 UI/UX Considerations

### Critical: Prevent Screen Flashing

**Problem:** Ink re-renders cause screen flashing/clearing

**Solutions:**
1. Use `React.memo` on all components
2. Use `useCallback` for all event handlers
3. Move static data (arrays, objects) outside components
4. Disable `patchConsole` in render options
5. Minimize component nesting

**Example:**
```typescript
// ❌ BAD - Creates new array on every render
<KeyBindings bindings={[
  { key: 'q', description: 'quit' }
]} />

// ✅ GOOD - Static constant
const BINDINGS = [{ key: 'q', description: 'quit' }];
<KeyBindings bindings={BINDINGS} />
```

### Column Alignment

**Problem:** Terminal text with ANSI codes breaks alignment

**Solution:** Strip ANSI codes for length calculation

```typescript
const padEnd = (str: string, length: number): string => {
  const cleaned = str.replace(/\x1b\[[0-9;]*m/g, '');
  const padLength = Math.max(0, length - cleaned.length);
  return str + ' '.repeat(padLength);
};
```

### Keyboard Bindings

- **Vim-style** - `h/j/k/l` for navigation
- **Arrow keys** - Standard navigation
- **Escape** - Go back
- **Enter/o** - Open/confirm
- **q** - Quit/back
- **r** - Refresh
- **Tab** - Switch panels

### Color Scheme (Tokyo Night)

- **Cyan** (#7dcfff) - Primary, drivers
- **Magenta** (#bb9af7) - Constructors
- **Green** (#9ece6a) - Points, success
- **Yellow** (#e0af68) - Season, rounds
- **Gold/Silver/Bronze** - Podium positions
- **Gray** - Secondary info

---

## 🏗 Build & Deployment

### TypeScript Build

```bash
npm run build
# Output: dist/
```

### Standalone Executables

```bash
# Current platform
npm run build:exe

# All platforms
npm run build:exe:all

# Specific platforms
npm run build:exe:linux
npm run build:exe:macos
npm run build:exe:windows
```

### Environment Variables

For builds, set `NODE_ENV=production` in CI/CD:
```yaml
env:
  NODE_ENV: production
```

### GitHub Actions

- **build.yml** - Runs on every push/PR
- **release.yml** - Runs on version tags

Create release:
```bash
git tag v5.0.0
git push origin v5.0.0
```

---

## 🔍 Troubleshooting

### TypeScript Errors

```bash
# Check for errors
npm run typecheck

# Common fixes:
# - Add missing imports
# - Fix type mismatches
# - Add proper type annotations
```

### Build Failures

**Issue:** Missing dependencies
```bash
# Solution
npm install
```

**Issue:** react-devtools-core not found
```bash
# Already fixed in package.json
```

**Issue:** Windows build fails with NODE_ENV
```bash
# Fixed: Use env: section in GitHub Actions
```

### UI Rendering Issues

**Issue:** Screen flashing
- Check: All components use React.memo
- Check: All callbacks use useCallback
- Check: Constants moved outside components

**Issue:** Column misalignment
- Check: Using padEnd/padStart with ANSI stripping
- Check: Consistent column widths

**Issue:** Keyboard not responding
- Check: useInput dependencies array
- Check: No input blocking states

---

## 🔄 Git Workflow

### Branch Naming

Current branch: `claude/rewrite-app-bun-cli-011CUpE2n83kRs8YmoJsQFrE`

Pattern: `claude/{description}-{sessionId}`

### Commit Messages

Format:
```
Short descriptive title (50 chars max)

Detailed description:
- What changed
- Why it changed
- Impact of changes

Technical details:
- File modifications
- Breaking changes
- Migration notes

Benefits:
✅ Benefit 1
✅ Benefit 2
```

### Commit Best Practices

1. **Atomic commits** - One logical change per commit
2. **Descriptive messages** - Explain the why, not just what
3. **Reference issues** - Link to issues when relevant
4. **Test before commit** - Ensure TypeScript compiles

### Push Retry Logic

Use exponential backoff for network resilience:
```bash
git push || sleep 2 && git push || sleep 4 && git push
```

---

## 📚 Additional Resources

### Key Files to Reference

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `BUILD.md` - Detailed build instructions
- `README.md` - User-facing documentation

### API Documentation

- [Ergast F1 API](http://ergast.com/mrd/)
- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [Zustand Guide](https://docs.pmnd.rs/zustand/)

### Caching Strategy

- **Standings:** 24 hours (1440 min)
- **Race Results:** 60 minutes
- **Schedule:** Calendar-aware caching
- **Method:** Atomic file writes with temp + rename

---

## ⚠️ Important Notes

### Do Not

- ❌ Add Python dependencies
- ❌ Use class components
- ❌ Inline object/array creation in render
- ❌ Forget React.memo on components
- ❌ Skip useCallback on event handlers
- ❌ Commit without type checking
- ❌ Push to wrong branch

### Always

- ✅ Use TypeScript strict mode
- ✅ Add .js extensions to imports
- ✅ Memoize components and callbacks
- ✅ Strip ANSI codes for alignment
- ✅ Test builds before committing
- ✅ Write clear commit messages
- ✅ Check TypeScript errors

---

## 🎯 Quick Reference

### Start Development
```bash
npm install && npm run dev
```

### Check for Issues
```bash
npm run typecheck
```

### Build & Test
```bash
npm run build && npm start
```

### Create Executable
```bash
npm run build:exe
```

### Full Quality Check
```bash
npm run typecheck && npm run build && npm run build:exe
```

---

**Last Updated:** 2025-11-05
**Project Version:** 5.0.0
**TypeScript Version:** 5.7.2
**Ink Version:** 5.0.1
