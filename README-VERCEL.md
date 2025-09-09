# Deploy via GitHub + Vercel

1. Faça push do seu projeto para o repositório GitHub desejado (ex: https://github.com/CyberStorebcb/seu-repo).
2. No painel do Vercel, clique em "Add New Project" e conecte seu repositório.
3. O Vercel detectará automaticamente o Quasar/Node e usará o `vercel.json` já configurado.
4. O build do frontend será feito automaticamente (`quasar build`), gerando `dist/spa`.
5. O backend será servido via `/api` usando o arquivo `backend/server.js`.
6. Adicione variáveis de ambiente sensíveis (como tokens, senhas) no painel do Vercel, nunca no GitHub.
7. Commits no GitHub disparam deploys automáticos.

**Dicas:**

- Não suba arquivos sensíveis ou pastas grandes (node_modules, dist, .env, etc) — já estão no `.gitignore`.
- Para builds locais: `quasar build` (frontend) e `npm install` (backend).
- Para debug, use os logs do Vercel e o painel de Environment Variables.
