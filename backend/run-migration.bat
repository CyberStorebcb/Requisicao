@echo off
echo Executando migracao do PostgreSQL...
cd /d "C:\Users\Italo Fontes\Requisicao\backend"
node migrations/init-postgres.js
pause
