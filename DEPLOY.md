# Sistema de Requisições - Deploy Guide

## 🚀 Deploy no Vercel + Neon DB

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta no [Neon](https://neon.tech)
- GitHub account com o projeto

---

## 📊 Configuração do Neon DB

### 1. Criar projeto no Neon
1. Acesse [neon.tech](https://neon.tech) e faça login
2. Clique em "Create a project"
3. Escolha a região mais próxima
4. Anote a **Database URL** fornecida

### 2. Configurar variáveis no Neon
A Database URL será algo como:
```
postgresql://username:password@ep-hostname.region.neon.tech/neondb?sslmode=require
```

---

## 🌐 Deploy no Vercel

### 1. Conectar repositório
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Import Project"
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente

### 2. Variáveis de Ambiente no Vercel
Adicione estas variáveis no dashboard do Vercel:

```env
DATABASE_URL=postgresql://username:password@ep-hostname.region.neon.tech/neondb?sslmode=require
POSTGRES_URL=postgresql://username:password@ep-hostname.region.neon.tech/neondb?sslmode=require
NODE_ENV=production
JWT_SECRET=sua_chave_jwt_muito_segura_aqui_com_pelo_menos_32_caracteres
FRONTEND_URL=https://seu-app.vercel.app
```

### 3. Configurações do Vercel
- **Framework**: Quasar
- **Build Command**: `npm run build`
- **Output Directory**: `dist/spa`
- **Root Directory**: `./` (raiz do projeto)

---

## 🔧 Configurações Importantes

### Frontend (src/services/api.js)
Substitua `your-app-name` pela sua URL real do Vercel:
```javascript
return 'https://seu-app-name.vercel.app/api'
```

### Backend (.env)
Atualize o FRONTEND_URL:
```env
FRONTEND_URL=https://seu-app-name.vercel.app
```

---

## 📝 Processo de Deploy

### 1. Preparar o código
```bash
# Commit e push das alterações
git add .
git commit -m "Configuração para deploy Vercel + Neon"
git push origin main
```

### 2. Deploy automático
- O Vercel fará deploy automaticamente quando detectar mudanças no GitHub
- A migração do banco será executada automaticamente via `vercel-build`

### 3. Verificar deploy
1. Acesse sua URL do Vercel
2. Teste a API: `https://seu-app.vercel.app/api`
3. Teste o frontend: requisições e gestão

---

## 🔍 Troubleshooting

### Problemas comuns:

**1. Erro de CORS**
- Verifique se FRONTEND_URL está configurado corretamente
- Confirme se a URL no api.js está correta

**2. Erro de conexão com banco**
- Verifique se DATABASE_URL está correto
- Confirme se o Neon DB está ativo

**3. Erro 404 na API**
- Verifique se vercel.json está na raiz
- Confirme se as rotas estão configuradas corretamente

**4. Build failure**
- Verifique se todas as dependências estão no package.json
- Confirme se não há erros de sintaxe

### Logs úteis:
- Vercel Functions: Dashboard > Functions > View Logs
- Neon Logs: Dashboard > Monitoring

---

## 📊 Monitoramento

### Métricas importantes:
- **Uptime**: Monitor de disponibilidade
- **Performance**: Tempo de resposta da API
- **Database**: Uso de conexões no Neon
- **Storage**: Tamanho do banco de dados

### Ferramentas recomendadas:
- **Vercel Analytics**: Métricas de frontend
- **Neon Console**: Monitoramento do banco
- **UptimeRobot**: Monitor externo (opcional)

---

## 🔄 CI/CD Pipeline

O projeto está configurado para:
1. **Push** para main → **Deploy automático**
2. **Pull Request** → **Preview deploy**
3. **Migration** → **Executada automaticamente**

---

## 🛡️ Segurança

### Checklist de segurança:
- [ ] JWT_SECRET com 32+ caracteres aleatórios
- [ ] DATABASE_URL não exposta no código
- [ ] CORS configurado corretamente
- [ ] SSL habilitado (automático no Vercel/Neon)
- [ ] Variáveis de ambiente não commitadas

---

## 🚀 Pós-Deploy

Após o deploy bem-sucedido:

1. ✅ **Teste completo**:
   - Criar requisição
   - Visualizar no painel de gestão
   - Verificar ranking

2. ✅ **Performance**:
   - Tempo de carregamento < 3s
   - API respondendo < 500ms

3. ✅ **Monitoramento**:
   - Configurar alerts no Vercel
   - Verificar logs regularmente

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs no Vercel Dashboard
2. Teste a conexão com o banco no Neon Console
3. Confirme se todas as variáveis estão configuradas

**Status URLs:**
- Frontend: `https://seu-app.vercel.app`
- API Health: `https://seu-app.vercel.app/api`
- Database: Neon Console
