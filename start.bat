@echo off
echo ============================================
echo   CitizenConnect - Starting Project
echo ============================================

echo.
echo Installing backend dependencies...
cd backend
call npm install

echo.
echo Seeding database with sample data...
call npm run seed

echo.
echo Starting backend server on http://localhost:5000 ...
start "CitizenConnect Backend" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Starting frontend on http://localhost:3000 ...
cd ..\frontend
start "CitizenConnect Frontend" cmd /k "npx serve public -p 3000"

echo.
echo ============================================
echo   CitizenConnect is running!
echo   Open: http://localhost:3000
echo.
echo   Demo accounts:
echo   Citizen: jean@citizenconnect.rw / citizen123
echo   Leader:  leader@citizenconnect.rw / leader123
echo ============================================
pause
