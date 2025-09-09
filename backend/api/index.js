const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const requisicaoRoutes = require('./routes/requisicoes');
const usuarioRoutes = require('./routes/usuarios');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:9000', 'https://your-app.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API funcionando!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api/requisicoes', requisicaoRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro:', error);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// Para Vercel, exportar a app
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api`);
  });
}
