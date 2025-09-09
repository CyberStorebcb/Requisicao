const { Pool } = require('pg')
require('dotenv').config()

// Usa DATABASE_URL (NeonDB) se disponível, senão usa config local
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'requisicao_db',
      password: process.env.DB_PASSWORD || 'teteda33',
      port: process.env.DB_PORT || 5432,
    })

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL')
})

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco:', err)
})

module.exports = pool
