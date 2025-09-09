# Sistema de Requisições - CGB Engenharia

Sistema completo para gerenciamento de requisições de materiais e pendências, desenvolvido com Quasar (Vue 3) + Node.js + PostgreSQL.

## 🚀 Funcionalidades

### Frontend (Quasar/Vue 3)

- ✅ **Requisição de Materiais** - Formulário com pesquisa de colaboradores (64 cadastrados)
- ✅ **Lista de Requisições** - Visualização, filtros e aprovação/rejeição
- ✅ **Gestão de Pendências** - Cadastro com upload de imagens
- ✅ **Dashboard de Gestão** - Controle geral do sistema
- ✅ **Validação de Dias** - Requisições apenas segunda, quarta e sexta

### Backend (Node.js + Express)

- ✅ **API RESTful** completa
- ✅ **PostgreSQL** como banco de dados
- ✅ **Upload de arquivos** com Multer
- ✅ **Validações** robustas e sanitização

## 📋 Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 12
- npm ou yarn

## 🛠 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/CyberStorebcb/sistema-requisicoes.git
cd sistema-requisicoes
```

````

### 2. Frontend
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
````

### 3. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais PostgreSQL

# Executar migração (cria banco e tabelas)
node migrations/init-postgres.js

# Iniciar servidor
npm start
```

## 🔧 Configuração

### Banco de Dados PostgreSQL

Edite o arquivo `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=requisicao_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

### URLs de Desenvolvimento

- **Frontend**: http://localhost:9000
- **Backend**: http://localhost:3000

## 📊 API Endpoints

### Requisições

- `GET /api/requisicoes` - Listar todas
- `GET /api/requisicoes/:id` - Buscar específica
- `POST /api/requisicoes` - Criar nova
- `PATCH /api/requisicoes/:id/status` - Alterar status

### Pendências

- `GET /api/pendencias` - Listar todas
- `POST /api/pendencias` - Criar nova (com upload de imagem)

## 🚀 Deploy

### Vercel (Frontend)

```bash
npm run build:vercel
vercel --prod
```

### Neon DB (Produção)

Configure a `DATABASE_URL` no `.env` com a string de conexão do Neon.

## 👥 Colaboradores

Sistema inclui 64 colaboradores da CGB Engenharia:

- Pesquisa por **chapa** ou **nome**
- Auto-complete inteligente
- Validação obrigatória

## 🛡 Validações e Segurança

- ✅ Requisições apenas em dias úteis específicos
- ✅ Campos obrigatórios validados
- ✅ Upload seguro de imagens
- ✅ CORS configurado
- ✅ Sanitização de dados

## 📱 Responsividade

Interface totalmente responsiva para desktop, tablet e mobile.

---

🏢 **CGB Engenharia** - Sistema de Requisições v1.0
Desenvolvido por **Italo Fontes**

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
