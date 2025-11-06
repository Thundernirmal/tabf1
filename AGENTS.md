# 🤖 AI Agent Instructions for TabF1

**Project:** TabF1 - Formula 1 Terminal Dashboard
**Stack:** TypeScript, React, Ink, Bun
**Purpose:** Guide AI agents working on this codebase

---

## 🎯 Mission Statement

TabF1 is a **production-ready Formula 1 terminal dashboard** providing real-time standings, race results, and performance data through an interactive CLI interface.

**Core Values:**
- **Performance First** - Zero screen flashing, smooth navigation
- **Type Safety** - Strict TypeScript, no compromises
- **User Experience** - Clean, intuitive, responsive interface
- **Code Quality** - Maintainable, well-documented, tested

---

## 🚀 Quick Start for Agents

### First Actions (in order)

1. **Read project structure**
   ```bash
   ls -la
   cat package.json
   cat tsconfig.json
   ```

2. **Check current state**
   ```bash
   git status
   git log --oneline -5
   npm run typecheck
   ```

3. **Understand the task**
   - Read user request carefully
   - Check existing code patterns
   - Plan changes before implementing

4. **Make changes**
   - Read files before editing
   - Follow code standards
   - Test incrementally

5. **Verify and commit**
   ```bash
   npm run typecheck
   npm run build
   git add -A
   git commit -m "Clear message"
   git push
   ```

---

## 📋 Critical Rules

### MUST DO

✅ **Always read files before editing** - Use Read tool first
✅ **Use React.memo on all components** - Prevent re-renders
✅ **Use useCallback for all handlers** - Stabilize references
✅ **Move constants outside components** - No inline arrays/objects
✅ **Strip ANSI codes for alignment** - Use provided helper functions
✅ **Add .js extensions to imports** - ES modules requirement
✅ **Run typecheck before committing** - Zero tolerance for type errors
✅ **Test builds** - Ensure `npm run build` succeeds
✅ **Write clear commit messages** - Explain what and why
✅ **Push to correct branch** - `claude/rewrite-app-bun-cli-011CUpE2n83kRs8YmoJsQFrE`

### NEVER DO

❌ **Don't add Python code** - Project is 100% TypeScript
❌ **Don't use class components** - Only functional components
❌ **Don't create inline objects in render** - Causes re-renders
❌ **Don't forget dependency arrays** - Always complete arrays
❌ **Don't use `any` type** - Use proper TypeScript types
❌ **Don't skip Read before Edit** - Tool requirement
❌ **Don't commit without type checking** - Build will fail
❌ **Don't create nested Box components** - Causes flashing
❌ **Don't ignore ANSI code length** - Breaks alignment
❌ **Don't push to main branch** - Use feature branch

---

## 🏗 Architecture Overview

### State Management (Zustand)

**Location:** `src/hooks/useAppStore.ts`

**Pattern:**
```typescript
// ✅ CORRECT: Selective subscription
const currentScreen = useAppStore(state => state.currentScreen);

// ❌ WRONG: Subscribe to everything
const store = useAppStore();
```

**Navigation Methods:**
- `goToDashboard()` - Return to main screen
- `goToRaces()` - Open race calendar
- `goToDriverDetail(driverId)` - Show driver details
- `goToConstructorDetail(constructorId)` - Show team details
- `goToRaceDetail(season, round)` - Show race results
- `goBack()` - Navigate back

### Component Hierarchy

```
App
├── Dashboard (main standings)
│   ├── Header
│   ├── DriverTable
│   ├── ConstructorTable
│   └── KeyBindings
├── Races (calendar)
│   ├── Header
│   ├── RaceList
│   └── KeyBindings
├── DriverDetail
├── ConstructorDetail
└── RaceDetail
```

### Data Flow

```
User Input
    ↓
useInput hook
    ↓
State Update (Zustand)
    ↓
Component Re-render (memoized)
    ↓
Ink Rendering
    ↓
Terminal Display
```

---

## 🎨 UI Performance Patterns

### Problem: Screen Flashing

**Cause:** Entire UI re-renders on state changes

**Solution Pattern:**

```typescript
// ❌ BAD: Recreates array every render
export const Component = () => {
  return <KeyBindings bindings={[
    { key: 'q', description: 'quit' }
  ]} />;
};

// ✅ GOOD: Static constant
const BINDINGS = [
  { key: 'q', description: 'quit' }
];

export const Component = React.memo(() => {
  return <KeyBindings bindings={BINDINGS} />;
});
```

### Problem: Column Misalignment

**Cause:** ANSI color codes affect string length

**Solution Pattern:**

```typescript
// Helper function
const padEnd = (str: string, length: number): string => {
  const cleaned = str.replace(/\x1b\[[0-9;]*m/g, '');
  const padLength = Math.max(0, length - cleaned.length);
  return str + ' '.repeat(padLength);
};

// Usage
const text = padEnd(coloredText, 20);
```

### Problem: Callback Recreation

**Cause:** Event handlers recreated every render

**Solution Pattern:**

```typescript
// ❌ BAD: New function every render
useInput((input, key) => {
  if (input === 'q') quit();
});

// ✅ GOOD: Memoized with dependencies
useInput(useCallback((input, key) => {
  if (input === 'q') quit();
}, [quit]));
```

---

## 🔧 Common Modifications

### Adding a New API Endpoint

**File:** `src/api/f1-client.ts`

1. Add method to F1ApiClient class
2. Use fetchWithCache for caching
3. Set appropriate cache expiration
4. Handle errors properly
5. Update types in `src/types/f1.ts`

**Template:**
```typescript
async getNewData(force: boolean = false): Promise<DataType[]> {
  try {
    const data = await this.fetchWithCache<any>(
      `/endpoint.json`,
      'cache_key',
      1440, // cache minutes
      force
    );
    return data.Table?.Items || [];
  } catch (error) {
    throw new Error(`Failed to fetch: ${(error as Error).message}`);
  }
}
```

### Adding a New Component

**Location:** `src/components/NewComponent.tsx`

**Template:**
```typescript
import React from 'react';
import { Box, Text } from 'ink';

interface NewComponentProps {
  data: string;
}

export const NewComponent = React.memo<NewComponentProps>(({ data }) => {
  return (
    <Box>
      <Text>{data}</Text>
    </Box>
  );
});

NewComponent.displayName = 'NewComponent';
```

### Adding a New Screen

**Location:** `src/screens/NewScreen.tsx`

1. Create screen component
2. Add screen type to `src/types/f1.ts`
3. Add navigation method to `src/hooks/useAppStore.ts`
4. Add route in `src/App.tsx`

**Template:**
```typescript
import React, { useCallback, useMemo } from 'react';
import { Box, useInput } from 'ink';
import { useAppStore } from '../hooks/useAppStore.js';

export const NewScreen: React.FC = () => {
  const { goBack } = useAppStore();

  useInput(useCallback((input, key) => {
    if (key.escape || input === 'q') {
      goBack();
    }
  }, [goBack]));

  return (
    <Box flexDirection="column">
      {/* Content */}
    </Box>
  );
};
```

### Modifying Table Layout

**File:** `src/components/StandingsTable.tsx`

**Rules:**
- Use text-based padding, not Box widths
- Strip ANSI codes for length calculation
- Test alignment with different data lengths
- Ensure consistent column widths

### Adding Keyboard Shortcuts

**Pattern:**
```typescript
useInput(useCallback((input, key) => {
  // Single key shortcuts
  if (input === 'r') {
    refresh();
    return;
  }

  // Arrow keys
  if (key.upArrow) {
    navigateUp();
    return;
  }

  // Special keys
  if (key.escape) {
    goBack();
    return;
  }

  // Combined check
  if (key.return || input === 'o') {
    openDetail();
    return;
  }
}, [refresh, navigateUp, goBack, openDetail]));
```

---

## 📊 Data Structures

### Driver Standing

```typescript
interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
    permanentNumber?: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
  }>;
}
```

### Constructor Standing

```typescript
interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
}
```

### Race

```typescript
interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
  Results?: RaceResult[];
}
```

---

## 🧪 Testing Checklist

Before committing any changes:

- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] Dev mode works: `npm run dev`
- [ ] No screen flashing when navigating
- [ ] Columns are aligned properly
- [ ] Keyboard shortcuts work
- [ ] No console errors
- [ ] Loading states display correctly
- [ ] Error handling works
- [ ] Data caching works
- [ ] All imports have .js extensions
- [ ] No unused variables/imports
- [ ] Components use React.memo
- [ ] Handlers use useCallback

---

## 🔍 Debugging Techniques

### TypeScript Errors

```bash
# Check errors
npm run typecheck

# Common issues:
# - Missing .js extension: import { x } from './file.js'
# - Type mismatch: Check interface definitions
# - Any usage: Replace with proper types
```

### UI Rendering Issues

**Screen Flashing:**
1. Check if component uses React.memo
2. Check if handlers use useCallback
3. Check if constants are outside component
4. Check dependency arrays

**Column Misalignment:**
1. Verify padEnd/padStart functions
2. Check ANSI code stripping
3. Test with different data
4. Verify consistent widths

**Keyboard Not Working:**
1. Check useInput dependency array
2. Verify no blocking states (loading)
3. Check input conditions
4. Test key combinations

### Build Failures

```bash
# Clean and rebuild
npm run clean
rm -rf node_modules
npm install
npm run build
```

### Git Issues

```bash
# Check current branch
git status
git log --oneline -5

# Verify branch name
# Should be: claude/rewrite-app-bun-cli-011CUpE2n83kRs8YmoJsQFrE

# Reset if needed (CAUTION)
git reset --hard HEAD~1
```

---

## 📝 Commit Message Format

### Template

```
Short imperative title (50 chars)

Problem/Context:
- What issue this addresses
- Why the change was needed
- Impact on users

Changes Made:
- File 1: What changed
- File 2: What changed
- File 3: What changed

Technical Details:
- Implementation approach
- Key algorithms/patterns used
- Performance considerations

Benefits:
✅ Specific benefit 1
✅ Specific benefit 2
✅ Specific benefit 3
```

### Examples

**Good:**
```
Fix screen flashing during navigation

Problem:
UI was re-rendering on every keypress causing Matrix-like flashing

Changes:
- src/App.tsx: Added useCallback to handlers
- src/components/Header.tsx: Wrapped with React.memo
- src/screens/Dashboard.tsx: Moved constants outside component

Benefits:
✅ Smooth navigation
✅ Better performance
✅ Improved UX
```

**Bad:**
```
fix stuff
```

---

## 🔐 Security Considerations

### API Keys

- No API keys required (Ergast API is public)
- No authentication needed
- Rate limiting handled by caching

### Dependencies

- Review new dependencies carefully
- Check for known vulnerabilities
- Use exact versions in package.json

### User Data

- No user data collected
- No telemetry
- Local caching only (f1_cache.json)

---

## 🚢 Release Process

### Creating a Release

1. **Update version** in package.json
2. **Test thoroughly**
   ```bash
   npm run typecheck
   npm run build
   npm run build:exe
   ```
3. **Commit changes**
4. **Create and push tag**
   ```bash
   git tag v5.1.0
   git push origin v5.1.0
   ```
5. **GitHub Actions automatically:**
   - Builds executables
   - Creates release
   - Attaches binaries

### Version Numbering

- **Major (5.x.x):** Breaking changes
- **Minor (x.1.x):** New features
- **Patch (x.x.1):** Bug fixes

---

## 📚 Reference Documentation

### Key Files

- `package.json` - Dependencies, scripts
- `tsconfig.json` - TypeScript config
- `BUILD.md` - Build instructions
- `README.md` - User documentation
- `CLAUDE.md` - Claude-specific guide
- `AGENTS.md` - This file

### External Resources

- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [Zustand Docs](https://docs.pmnd.rs/zustand/)
- [Ergast API](http://ergast.com/mrd/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### API Endpoints Used

```
GET /current/driverStandings.json
GET /current/constructorStandings.json
GET /{year}/results.json?limit=100
GET /{year}.json
GET /current/drivers/{driverId}/results.json?limit={n}
GET /current/constructors/{constructorId}/results.json?limit={n}
GET /{year}/{round}/results.json
```

---

## 🎓 Learning Resources

### Understanding the Codebase

1. **Start with types** - `src/types/f1.ts`
2. **Check state management** - `src/hooks/useAppStore.ts`
3. **Review main screen** - `src/screens/Dashboard.tsx`
4. **Understand API client** - `src/api/f1-client.ts`
5. **Study components** - `src/components/`

### Code Patterns to Learn

- **React Hooks** - useState, useEffect, useCallback, useMemo
- **Zustand** - State management patterns
- **Ink** - Terminal UI rendering
- **TypeScript** - Strict typing patterns
- **ANSI Codes** - Terminal color/formatting

---

## ⚡ Performance Optimization

### Rendering Performance

1. **Component Memoization**
   ```typescript
   export const Component = React.memo<Props>(() => {
     // ...
   });
   ```

2. **Callback Stability**
   ```typescript
   const handler = useCallback(() => {
     // ...
   }, [deps]);
   ```

3. **Value Memoization**
   ```typescript
   const computed = useMemo(() => {
     return expensiveCalculation();
   }, [deps]);
   ```

4. **Static Constants**
   ```typescript
   const CONFIG = { key: 'value' }; // Outside component
   ```

### Data Fetching

- Use cache when possible
- Parallel requests with Promise.all
- Appropriate cache expiration
- Error handling with retries

### Build Performance

- TypeScript incremental builds
- Bun for fast compilation
- Minification for executables
- Tree-shaking unused code

---

## 🎯 Success Metrics

A successful change should:

- ✅ Pass TypeScript compilation
- ✅ Build without errors
- ✅ Have no screen flashing
- ✅ Maintain aligned columns
- ✅ Preserve keyboard functionality
- ✅ Include proper error handling
- ✅ Follow coding standards
- ✅ Have clear documentation
- ✅ Use proper Git workflow
- ✅ Improve user experience

---

## 📞 Getting Help

### If Stuck

1. Read this document thoroughly
2. Check CLAUDE.md for specifics
3. Review existing code patterns
4. Test incrementally
5. Ask specific questions

### Common Issues Index

- **Screen Flashing** → See UI Performance Patterns
- **Type Errors** → See TypeScript section
- **Build Failures** → See Debugging Techniques
- **Git Problems** → See Git Workflow
- **API Issues** → See Data Structures

---

**Document Version:** 1.0
**Last Updated:** 2025-11-05
**Project Version:** 5.0.0
**Maintained By:** TabF1 Development Team

---

## 🚦 Quick Decision Tree

```
Need to modify code?
├─ Yes → Read file first
│   ├─ Component? → Use React.memo
│   ├─ Handler? → Use useCallback
│   ├─ Data? → Use useMemo
│   └─ Constant? → Move outside component
└─ Done → Test → Commit → Push

Screen flashing?
├─ Check React.memo usage
├─ Check useCallback on handlers
├─ Check static constants
└─ Check dependency arrays

Columns misaligned?
├─ Use padEnd/padStart helpers
├─ Strip ANSI codes
└─ Test with various data

Build failing?
├─ Run typecheck
├─ Fix type errors
├─ Clean and rebuild
└─ Check dependencies
```

**Remember:** Quality over speed. Take time to understand before modifying.
