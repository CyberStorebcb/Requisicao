const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

// Usar PostgreSQL
require('./config/database')

const requisicaoRoutes = require('./routes/requisicoes')
const usuarioRoutes = require('./routes/usuarios')
const pendenciaRoutes = require('./routes/pendencias')
const sisRoutes = require('./routes/sis')

const app = express()
const PORT = process.env.PORT || 3000
const dropboxAvisos = require('./routes/dropboxAvisos')

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', dropboxAvisos)

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Rotas
app.use('/api/requisicoes', requisicaoRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/pendencias', pendenciaRoutes)
app.use('/api/sis', sisRoutes)

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// Middleware de tratamento de erros
app.use((error, req, res) => {
  console.error('Erro:', error)
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
  })
})

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
})
