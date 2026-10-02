@echo off
echo ===================================================
echo   KHOI DONG BRAIN DUMP - AI PLANNER (FULLSTACK)
echo ===================================================

start "Brain Dump Backend" cmd /k "cd /d d:\JOB IT\backend && npm run dev"
timeout /t 2 >nul
start "Brain Dump Frontend" cmd /k "cd /d d:\JOB IT\frontend && npm run dev"

echo.
echo  Ung dung dang chay tai: http://localhost:5173
echo  Backend API dang chay tai: http://localhost:5000
echo ===================================================
