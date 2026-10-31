@echo off
title SHELLY - Desktop Mission Control
cd /d "C:\temp\project-jarvis"
set PYTHONPATH=C:\temp\project-jarvis
echo ============================================================
echo   Launching S.H.E.L.L.Y Cyber Deck for NatC...
echo ============================================================
start "" ".\.venv\Scripts\python.exe" "arayuz.py"
exit
