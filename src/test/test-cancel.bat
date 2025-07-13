@echo off
:loop
echo Press Ctrl+C to interrupt (iteration %time%)
timeout /t 2 /nobreak >nul
goto loop