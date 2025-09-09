# 🚀 Guia para Sincronizar com GitHub

## 📋 Pré-requisitos

1. **Git instalado** - Baixe em: https://git-scm.com/download/win
2. **Conta GitHub** - Acesse: https://github.com/CyberStorebcb

## 🔧 Passos para Sincronização

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/CyberStorebcb
2. Clique em **"New repository"** (botão verde)
3. Configure:
   - **Repository name**: `sistema-requisicoes`
   - **Description**: `Sistema de Requisições de Materiais - CGB Engenharia`
   - **Visibility**: Private ou Public (sua escolha)
   - ❌ **NÃO** marque "Initialize with README" (já temos um)
4. Clique **"Create repository"**

### 2. Comandos Git no Terminal

Abra o **PowerShell** ou **Git Bash** no diretório do projeto:

```bash
# Navegar para o projeto
cd "C:\Users\Italo Fontes\Requisicao"

# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "Initial commit - Sistema de Requisições CGB Engenharia"

# Adicionar repositório remoto (substitua pela URL do seu repo)
git remote add origin https://github.com/CyberStorebcb/sistema-requisicoes.git

# Configurar branch principal
git branch -M main

# Enviar para GitHub
git push -u origin main
```

### 3. Comandos Futuros (para atualizações)

```bash
# Adicionar mudanças
git add .

# Criar commit
git commit -m "Descrição das mudanças"

# Enviar para GitHub
git push
```

## 📂 Estrutura que será enviada

```
sistema-requisicoes/
├── src/                    # Frontend Vue/Quasar
├── backend/               # Backend Node.js + PostgreSQL
├── public/                # Arquivos estáticos
├── README.md              # Documentação completa
├── package.json           # Dependências frontend
├── .gitignore             # Arquivos ignorados
└── vercel.json            # Configuração deploy
```

## 🔐 Arquivos Ignorados (.gitignore)

✅ **Inclusos no repositório**:

- Código fonte completo
- Documentação
- Configurações de exemplo
- Estrutura de pastas

❌ **Ignorados pelo Git**:

- `node_modules/`
- `.env` (credenciais)
- `backend/uploads/` (arquivos enviados)
- `.quasar/` (cache)
- `dist/` (build)

## 🎯 URL Final

Após criar o repositório, ficará disponível em:
**https://github.com/CyberStorebcb/sistema-requisicoes**

## ⚡ Dicas Importantes

1. **Nunca** commit arquivos `.env` (já está no .gitignore)
2. **Sempre** teste localmente antes de fazer push
3. **Use commits descritivos** para facilitar o histórico
4. **Mantenha** o README atualizado com mudanças

## 🔧 Se der erro de autenticação

1. Configure seu nome e email:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@gmail.com"
```

2. Use **Personal Access Token** ao invés de senha no GitHub (desde 2021)

---

✅ **Projeto pronto para sincronização com GitHub!**
