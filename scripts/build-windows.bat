@echo off
REM Build executable for Windows x64

setlocal

set BUILD_DIR=build
set OUTPUT=%BUILD_DIR%\tabf1-windows-x64.exe

echo.
echo 🏎️  Building TabF1 for Windows (x64)...
echo.

REM Check if Bun is installed
where bun >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Bun is not installed
    echo Install: https://bun.sh
    exit /b 1
)

REM Create build directory
if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call bun install
    echo.
)

REM Build executable
echo 🔨 Compiling for Windows x64...
set NODE_ENV=production
call bun build ./src/index.tsx --compile --target=bun-windows-x64 --outfile="%OUTPUT%" --minify

if exist "%OUTPUT%" (
    echo.
    echo ✨ Success! Built: %OUTPUT%
    echo.
    echo Run with: %OUTPUT%
) else (
    echo.
    echo ❌ Build failed
    exit /b 1
)

endlocal
