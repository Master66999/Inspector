@echo off
:: PackCheck - Automatic MySQL Root Password Reset Script
:: Must be run as Administrator
echo ========================================================
echo   PackCheck - MySQL 8.0 Root Password Reset Tool
echo ========================================================
echo.
echo Checking Administrator privileges...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please right-click this file and select "Run as administrator"!
    echo.
    pause
    exit /b 1
)

echo [1/4] Stopping MySQL80 service...
net stop MySQL80

echo [2/4] Creating temporary init SQL file...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123'; > "%TEMP%\mysql-init.sql"

echo [3/4] Resetting root password to 'root123'...
start "" /B "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="%TEMP%\mysql-init.sql"
timeout /t 6 /nobreak >nul
taskkill /F /IM mysqld.exe >nul 2>&1
del "%TEMP%\mysql-init.sql" >nul 2>&1

echo [4/4] Restarting MySQL80 service...
net start MySQL80

echo.
echo ========================================================
echo Testing connection with new password 'root123'...
echo ========================================================
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot123 -e "SELECT 'Password successfully reset to: root123' AS Status;"
echo.
echo You are all set! Now you can return to Antigravity.
pause
