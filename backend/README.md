# Sistema de Requisições - Backend

API REST para gerenciar requisições de materiais com banco de dados PostgreSQL.

## 🚀 Configuração

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar PostgreSQL

#### Instalar PostgreSQL:
- Windows: https://www.postgresql.org/download/windows/
- Ou usar Docker: `docker run --name postgres-requisicoes -e POSTGRES_PASSWORD=minhasenha -d -p 5432:5432 postgres`

#### Criar banco de dados:
```sql
CREATE DATABASE requisicao_db;
```

### 3. Configurar variáveis de ambiente

Edite o arquivo `.env` com suas configurações:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=requisicao_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_jwt_aqui
```

### 4. Executar migrações
```bash
npm run migrate
```

### 5. Iniciar servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📊 Estrutura do Banco de Dados

### Tabela: `usuarios`
- `id` (SERIAL PRIMARY KEY)
- `nome_completo` (VARCHAR)
- `email` (VARCHAR UNIQUE)
- `created_at`, `updated_at` (TIMESTAMP)

### Tabela: `requisicoes`
- `id` (SERIAL PRIMARY KEY)
- `usuario_id` (INTEGER FK)
- `nome_solicitante` (VARCHAR)
- `observacoes` (TEXT)
- `status` (VARCHAR: 'Pendente', 'Aprovado', 'Rejeitado')
- `created_at`, `updated_at` (TIMESTAMP)

### Tabela: `requisicao_materiais`
- `id` (SERIAL PRIMARY KEY)
- `requisicao_id` (INTEGER FK)
- `descricao` (VARCHAR)
- `quantidade` (INTEGER)
- `unidade` (VARCHAR)
- `created_at` (TIMESTAMP)

## 🔗 Endpoints da API

### Requisições
- `GET /api/requisicoes` - Listar todas as requisições
- `GET /api/requisicoes/:id` - Buscar requisição específica
- `POST /api/requisicoes` - Criar nova requisição
- `PUT /api/requisicoes/:id/status` - Atualizar status
- `DELETE /api/requisicoes/:id` - Remover requisição
- `GET /api/requisicoes/stats/ranking` - Ranking de solicitantes

### Usuários
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/:id` - Buscar usuário específico
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Remover usuário

### Outros
- `GET /api/health` - Verificar status do servidor

## 📝 Exemplo de Requisição POST

```json
{
  "nome_solicitante": "João Silva",
  "observacoes": "Materiais para escritório",
  "materiais": [
    {
      "descricao": "Papel A4",
      "quantidade": 5,
      "unidade": "pacotes"
    },
    {
      "descricao": "Canetas azuis",
      "quantidade": 10,
      "unidade": "unidades"
    }
  ]
}
```

## 🛠️ Tecnologias

- Node.js
- Express.js
- PostgreSQL
- pg (driver PostgreSQL)
- CORS
- Express Validator
- dotenv
