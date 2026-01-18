#!/usr/bin/env python3
"""
PantryPal - Cross-Platform Launch Script
Works on Windows, Mac, and Linux with any Python interpreter
"""

import os
import sys
import subprocess
import signal
import time
import shutil
from pathlib import Path

# Store process references for cleanup
processes = []

def print_colored(text, color):
    """Print colored text (works on most terminals)"""
    colors = {
        'red': '\033[0;31m',
        'green': '\033[0;32m',
        'yellow': '\033[1;33m',
        'reset': '\033[0m'
    }
    # Windows cmd doesn't support ANSI by default, but modern terminals do
    if os.name == 'nt':
        try:
            os.system('')  # Enable ANSI on Windows 10+
        except:
            pass
    print(f"{colors.get(color, '')}{text}{colors['reset']}")

def find_python():
    """Find the Python interpreter to use"""
    script_dir = Path(__file__).parent.resolve()
    parent_dir = script_dir.parent
    
    # Check common virtual environment locations
    venv_paths = [
        parent_dir / '.venv' / 'bin' / 'python',           # Mac/Linux venv in parent
        parent_dir / '.venv' / 'Scripts' / 'python.exe',   # Windows venv in parent
        script_dir / '.venv' / 'bin' / 'python',           # Mac/Linux venv in project
        script_dir / '.venv' / 'Scripts' / 'python.exe',   # Windows venv in project
        script_dir / 'venv' / 'bin' / 'python',            # Mac/Linux venv
        script_dir / 'venv' / 'Scripts' / 'python.exe',    # Windows venv
        parent_dir / 'venv' / 'bin' / 'python',            # Mac/Linux venv in parent
        parent_dir / 'venv' / 'Scripts' / 'python.exe',    # Windows venv in parent
    ]
    
    for venv_path in venv_paths:
        if venv_path.exists():
            print_colored(f"📦 Using virtual environment: {venv_path}", 'green')
            return str(venv_path)
    
    # Fall back to system Python
    python_cmd = sys.executable
    print_colored(f"📦 Using system Python: {python_cmd}", 'yellow')
    return python_cmd

def find_npm():
    """Find npm command"""
    npm_cmd = 'npm.cmd' if os.name == 'nt' else 'npm'
    if shutil.which(npm_cmd):
        return npm_cmd
    if shutil.which('npm'):
        return 'npm'
    return None

def cleanup(signum=None, frame=None):
    """Clean up background processes on exit"""
    print()
    print_colored("Shutting down servers...", 'yellow')
    for proc in processes:
        try:
            if os.name == 'nt':
                proc.terminate()
            else:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        except (ProcessLookupError, OSError):
            pass
    sys.exit(0)

def main():
    script_dir = Path(__file__).parent.resolve()
    backend_dir = script_dir / 'backend'
    
    print_colored("🍳 Starting PantryPal...", 'green')
    print()
    
    # Check if backend .env exists
    backend_env = backend_dir / '.env'
    if not backend_env.exists():
        print_colored("⚠️  Warning: backend/.env not found. Copy .env.example and add your GUMLOOP API key.", 'yellow')
    
    # Find Python interpreter
    python_cmd = find_python()
    
    # Find npm
    npm_cmd = find_npm()
    if not npm_cmd:
        print_colored("❌ Error: npm not found. Please install Node.js.", 'red')
        sys.exit(1)
    
    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    if os.name != 'nt':
        signal.signal(signal.SIGHUP, cleanup)
    
    # Start Flask backend
    print_colored("🚀 Starting Flask backend on http://localhost:5001", 'green')
    try:
        if os.name == 'nt':
            # Windows: use CREATE_NEW_PROCESS_GROUP
            backend_proc = subprocess.Popen(
                [python_cmd, 'app.py'],
                cwd=str(backend_dir),
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
            )
        else:
            # Mac/Linux: use process group
            backend_proc = subprocess.Popen(
                [python_cmd, 'app.py'],
                cwd=str(backend_dir),
                preexec_fn=os.setsid
            )
        processes.append(backend_proc)
    except Exception as e:
        print_colored(f"❌ Failed to start backend: {e}", 'red')
        sys.exit(1)
    
    # Give backend a moment to start
    time.sleep(1)
    
    # Start React frontend
    print_colored("🚀 Starting React frontend on http://localhost:5173", 'green')
    try:
        if os.name == 'nt':
            frontend_proc = subprocess.Popen(
                [npm_cmd, 'run', 'dev'],
                cwd=str(script_dir),
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                shell=True
            )
        else:
            frontend_proc = subprocess.Popen(
                [npm_cmd, 'run', 'dev'],
                cwd=str(script_dir),
                preexec_fn=os.setsid
            )
        processes.append(frontend_proc)
    except Exception as e:
        print_colored(f"❌ Failed to start frontend: {e}", 'red')
        cleanup()
        sys.exit(1)
    
    print()
    print_colored("✅ Both servers are running!", 'green')
    print_colored("   Frontend: http://localhost:5173", 'yellow')
    print_colored("   Backend:  http://localhost:5001/api", 'yellow')
    print()
    print_colored("Press Ctrl+C to stop both servers.", 'red')
    print()
    
    # Wait for processes
    try:
        while True:
            # Check if either process has died
            for proc in processes:
                if proc.poll() is not None:
                    print_colored(f"⚠️  A server process has stopped (exit code: {proc.returncode})", 'yellow')
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()

if __name__ == '__main__':
    main()
