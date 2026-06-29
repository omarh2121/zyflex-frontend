@echo off
:: Zyflex Frontend – Start dev server
:: Kør denne fil for at starte frontend lokalt

cd /d %~dp0

:: Sikrer devDependencies er installeret
set NODE_ENV=development
call npm install --include=dev --silent

:: Start Next.js dev server
set NODE_ENV=
call npx next dev

pause
