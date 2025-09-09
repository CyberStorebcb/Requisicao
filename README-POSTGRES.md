# Configuração PostgreSQL - Instruções de Execução

## ✅ Configurações Realizadas:

### 1. Arquivo `.env` atualizado:

- DB_USER=postgres
- DB_PASSWORD=teteda33
- DB_NAME=requisicao_db
- DB_HOST=localhost
- DB_PORT=5432

### 2. Arquivo `config/database.js` configurado para PostgreSQL local

### 3. Script de migração criado: `migrations/init-postgres.js`

### 4. Server.js atualizado para usar PostgreSQL

## 🚀 Passos para Execução:

### 1. Certifique-se que o PostgreSQL está rodando

- Serviço deve estar ativo no Windows
- pgAdmin deve conseguir conectar com usuário `postgres` e senha `teteda33`

### 2. Execute a migração:

```bash
cd "C:\Users\Italo Fontes\Requisicao\backend"
node migrations/init-postgres.js
```

### 3. Inicie o servidor backend:

```bash
npm start
# ou
node server.js
```

### 4. Inicie o frontend (em outro terminal):

```bash
cd "C:\Users\Italo Fontes\Requisicao"
npm run dev
```

## 📊 O que a migração faz:

1. **Cria o database** `requisicao_db` (se não existir)
2. **Cria as tabelas**:
   - usuarios
   - requisicoes
   - requisicao_materiais
   - pendencias
3. **Cria índices** para performance
4. **Insere dados de exemplo**:
   - 3 requisições com materiais
   - 2 pendências de exemplo

## 🔗 APIs Disponíveis:

- GET /api/requisicoes - Listar requisições
- GET /api/requisicoes/:id - Detalhes da requisição
- POST /api/requisicoes - Criar requisição
- PATCH /api/requisicoes/:id/status - Alterar status
- POST /api/pendencias - Criar pendência

## 🎯 Frontend:

- http://localhost:9000
- Menu: Requisição, Lista de Requisições, Gestão, Pendências

## ⚡ Se der erro de conexão:

1. Verifique se o PostgreSQL está rodando
2. Confirme usuário e senha no pgAdmin
3. Execute: `run-migration.bat`
