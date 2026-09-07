@echo off
echo Installing Python ML Service dependencies...

REM Try pip first, fall back to full path
pip install -r requirements.txt 2>nul || C:\Users\harsh\AppData\Local\Python\bin\python.exe -m pip install -r requirements.txt

echo.
echo Starting AgriBudget ML Service on port 8000...

REM Try python first, fall back to full path
python main.py 2>nul || C:\Users\harsh\AppData\Local\Python\bin\python.exe main.py
