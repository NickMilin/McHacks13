@echo off
REM PantryPal - Windows Launch Script
REM Runs the cross-platform Python launcher

echo Starting PantryPal...

REM Try to find Python in common locations
where python >nul 2>&1
if %errorlevel% equ 0 (
    python "%~dp0start.py"
    goto :end
)

where python3 >nul 2>&1
if %errorlevel% equ 0 (
    python3 "%~dp0start.py"
    goto :end
)

where py >nul 2>&1
if %errorlevel% equ 0 (
    py "%~dp0start.py"
    goto :end
)

echo Error: Python not found. Please install Python 3.8+
pause
exit /b 1

:end
