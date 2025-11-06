# 🏎️ TabF1 - Formula 1 Terminal Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Ink](https://img.shields.io/badge/Ink-5.0-cyan.svg)](https://github.com/vadimdemedes/ink)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A beautiful, interactive Formula 1 terminal dashboard built with modern TypeScript and React (Ink). Get real-time access to driver standings, constructor standings, race results, and detailed performance statistics—all from your terminal.

![TabF1 Dashboard](https://img.shields.io/badge/status-active-brightgreen)

## ✨ Features

### 🏆 Live Standings
- **Driver Championship**: Real-time driver standings with points, wins, and team information
- **Constructor Championship**: Current team standings and performance metrics
- **Beautiful UI**: Tokyo Night themed interface with intuitive color coding
- **Interactive Navigation**: Keyboard-driven interface with vim-like bindings

### 🏁 Race Information
- **Full Race Calendar**: View all races from the current F1 season
- **Race Results**: Detailed results for completed races
- **Race Status**: Visual indicators for completed, scheduled, and pending races
- **Winner Information**: Quick access to race winners and podium finishers

### 📊 Performance Details
- **Driver History**: View last 10 races for any driver with grid positions, finish positions, and points
- **Constructor History**: Team performance across recent races with both drivers' results
- **Race Details**: Full classification with grid positions, finish times, and status

### 🎨 Enhanced UX
- **Smart Caching**: Intelligent API caching to minimize network requests and improve speed
- **Responsive Design**: Adapts to different terminal sizes
- **Loading States**: Beautiful loading animations with race-themed spinners
- **Error Handling**: Graceful error messages with retry options
- **Color Coding**: Podium positions highlighted with gold, silver, and bronze
- **Points Zones**: Visual distinction for points-scoring positions (Top 10)

## 📦 Installation

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **bun** package manager

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/tabf1.git
cd tabf1

# Install dependencies
npm install
# or with bun
bun install

# Run the app in development mode
npm run dev
# or with bun
bun run dev
```

### Build for Production

```bash
# Build TypeScript to JavaScript
npm run build

# Run the built version
npm start

# Or run directly with Node
node dist/index.js
```

### Global Installation

```bash
# Build the project
npm run build

# Link globally (optional)
npm link

# Now you can run it from anywhere
tabf1
```

### 📦 Build Standalone Executable (Bun)

Create a single, portable executable that can run without Node.js or any dependencies!

**Prerequisites:**
- Install [Bun](https://bun.sh): `curl -fsSL https://bun.sh/install | bash`

**Build for your current platform:**
```bash
npm run build:exe
# or with bun
bun run build:exe

# The executable will be in the build/ directory
./build/tabf1-linux-x64        # Linux
./build/tabf1-macos-x64         # macOS Intel
./build/tabf1-macos-arm64       # macOS Apple Silicon
./build/tabf1-windows-x64.exe   # Windows
```

**Build for specific platforms:**
```bash
npm run build:exe:linux     # Build for Linux x64
npm run build:exe:macos     # Build for macOS (both Intel and Apple Silicon)
npm run build:exe:windows   # Build for Windows x64
npm run build:exe:all       # Build for all platforms
```

**Standalone script usage:**
```bash
# Direct script execution
./scripts/build.sh              # Build for current platform
./scripts/build-all.sh          # Build for all platforms
./scripts/build-linux.sh        # Build for Linux only
./scripts/build-macos.sh        # Build for macOS only
./scripts/build-windows.bat     # Build for Windows only (on Windows)
```

**Benefits:**
- ✅ Single file - no dependencies needed
- ✅ Fast startup time
- ✅ Portable - copy and run anywhere
- ✅ Small size (~40-60MB including runtime)
- ✅ No Node.js installation required on target machine

**Download Pre-built Executables:**

Visit the [Releases page](https://github.com/yourusername/tabf1/releases) to download pre-built executables for your platform.

## 🎮 Usage

### Keyboard Controls

#### Dashboard (Main Screen)
| Key | Action |
|-----|--------|
| `←` / `→` | Switch between Driver and Constructor panels |
| `↑` / `↓` or `k` / `j` | Navigate up/down in lists |
| `Tab` | Toggle between panels |
| `Enter` or `o` | Open details for selected item |
| `R` | Open Race Calendar |
| `r` | Refresh data |
| `q` | Quit application |

#### Race Calendar
| Key | Action |
|-----|--------|
| `↑` / `↓` or `k` / `j` | Navigate through races |
| `Enter` or `o` | View race results (if available) |
| `r` | Refresh race data |
| `Esc` or `q` | Back to Dashboard |

#### Detail Screens
| Key | Action |
|-----|--------|
| `r` | Refresh data |
| `Esc` or `q` | Back to previous screen |

### Navigation Flow

```
Dashboard
├── Driver Details (Press Enter on a driver)
│   └── Shows last 10 race results
├── Constructor Details (Press Enter on a constructor)
│   └── Shows last 10 race results with both drivers
└── Race Calendar (Press R)
    └── Race Details (Press Enter on a completed race)
        └── Shows full race classification
```

## 🏗️ Project Structure

```
tabf1/
├── src/
│   ├── api/
│   │   └── f1-client.ts          # F1 API client with caching
│   ├── components/
│   │   ├── ErrorMessage.tsx      # Error display component
│   │   ├── Header.tsx            # App header with branding
│   │   ├── KeyBindings.tsx       # Keyboard shortcuts display
│   │   ├── Loading.tsx           # Loading spinner component
│   │   ├── RaceList.tsx          # Race calendar table
│   │   └── StandingsTable.tsx    # Driver/Constructor tables
│   ├── hooks/
│   │   └── useAppStore.ts        # Zustand state management
│   ├── screens/
│   │   ├── ConstructorDetail.tsx # Constructor detail screen
│   │   ├── Dashboard.tsx         # Main dashboard screen
│   │   ├── DriverDetail.tsx      # Driver detail screen
│   │   ├── RaceDetail.tsx        # Race results screen
│   │   └── Races.tsx             # Race calendar screen
│   ├── themes/
│   │   └── tokyo-night.ts        # Color scheme and styling
│   ├── types/
│   │   └── f1.ts                 # TypeScript type definitions
│   ├── utils/
│   │   └── formatters.ts         # Data formatting utilities
│   ├── App.tsx                   # Root app component
│   └── index.tsx                 # Entry point
├── scripts/
│   ├── build.sh                  # Build executable for current platform
│   ├── build-all.sh              # Build executables for all platforms
│   ├── build-linux.sh            # Build for Linux x64
│   ├── build-macos.sh            # Build for macOS (Intel + Apple Silicon)
│   └── build-windows.bat         # Build for Windows x64
├── .github/
│   └── workflows/
│       ├── build.yml             # CI build workflow
│       └── release.yml           # Release automation workflow
├── dist/                         # Compiled JavaScript (after build)
├── build/                        # Standalone executables (after build:exe)
├── f1_cache.json                 # API response cache
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## 🎨 Theme

TabF1 uses the **Tokyo Night** color scheme, optimized for modern terminals:

- **Cyan** (`#7dcfff`) - Primary UI elements, drivers
- **Magenta** (`#bb9af7`) - Constructor/team elements
- **Green** (`#9ece6a`) - Points and success indicators
- **Yellow** (`#e0af68`) - Season info and round numbers
- **Gold/Silver/Bronze** - Podium positions (1st, 2nd, 3rd)
- **Gray** - Secondary information and dimmed text

## 🔧 Technical Details

### Built With

- **[Ink](https://github.com/vadimdemedes/ink)** - React for interactive CLIs
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[Chalk](https://github.com/chalk/chalk)** - Terminal string styling
- **[date-fns](https://date-fns.org/)** - Date formatting utilities

### API

Data is fetched from the **[Ergast F1 API](http://ergast.com/mrd/)**, which provides:
- Current season driver standings
- Current season constructor standings
- Race calendar and results
- Historical race data
- Driver and team statistics

### Caching Strategy

TabF1 implements intelligent caching to optimize API usage:
- **Standings**: Cached for 24 hours (1440 minutes)
- **Race Results**: Cached for 60 minutes on race days
- **Calendar**: Cached with calendar awareness (longer on non-race days)
- **Atomic Writes**: Cache files use temporary file + rename to prevent corruption
- **Graceful Degradation**: Corrupted cache is ignored without crashing

## 🚀 Development

### Scripts

```bash
# Development mode with hot reload
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Clean build artifacts
npm run clean

# Run production build
npm start

# Build standalone executables
npm run build:exe           # Build for current platform
npm run build:exe:all       # Build for all platforms
npm run build:exe:linux     # Build for Linux x64
npm run build:exe:macos     # Build for macOS (Intel + Apple Silicon)
npm run build:exe:windows   # Build for Windows x64
```

### Automated Builds

The project includes GitHub Actions workflows for automated building and releasing:

- **Build Workflow** (`.github/workflows/build.yml`): Automatically builds executables for all platforms on every push and PR
- **Release Workflow** (`.github/workflows/release.yml`): Creates GitHub releases with pre-built executables when you push a version tag

**Creating a release:**
```bash
# Tag a new version
git tag v5.0.0
git push origin v5.0.0

# GitHub Actions will automatically:
# 1. Build executables for all platforms
# 2. Create a GitHub release
# 3. Attach all executables to the release
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Ergast F1 API](http://ergast.com/mrd/) for providing comprehensive F1 data
- [Ink](https://github.com/vadimdemedes/ink) for the amazing CLI framework
- [Tokyo Night](https://github.com/tokyo-night/tokyo-night-vscode-theme) for the beautiful color scheme
- Formula 1 community for the inspiration

## 📧 Contact

Project Link: [https://github.com/yourusername/tabf1](https://github.com/yourusername/tabf1)

---

**Made with ❤️ for F1 fans by terminal enthusiasts**

🏎️💨 Happy Racing! 🏁
