@echo off
echo ==========================================
echo  CONFIGURACAO DO BANCO DE DADOS POSTGRESQL
echo ==========================================
echo.

echo 1. Instalando PostgreSQL (se nao estiver instalado)
echo    - Baixe de: https://www.postgresql.org/download/windows/
echo    - Ou use Docker: docker run --name postgres-requisicoes -e POSTGRES_PASSWORD=123456 -d -p 5432:5432 postgres
echo.

echo 2. Criando o banco de dados
echo    Execute no psql ou pgAdmin:
echo    CREATE DATABASE requisicao_db;
echo.

echo 3. Configurando as variaveis de ambiente
echo    Edite o arquivo .env com suas configuracoes:
echo    DB_HOST=localhost
echo    DB_PORT=5432
echo    DB_NAME=requisicao_db
echo    DB_USER=postgres
echo    DB_PASSWORD=sua_senha_aqui
echo.

echo 4. Instalando dependencias do backend
cd backend
npm install
echo.

echo 5. Executando migracoes
npm run migrate
echo.

echo 6. Iniciando o servidor
echo    Para desenvolvimento: npm run dev
echo    Para producao: npm start
echo.

echo Setup completo! O servidor estara disponivel em http://localhost:3000
pause
