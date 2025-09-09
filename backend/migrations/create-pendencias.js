const { Pool } = require('pg')

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'requisicoes_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
})

async function createPendenciasTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS pendencias (
        id SERIAL PRIMARY KEY,
        pep VARCHAR(50) NOT NULL,
        tipo_pendencia VARCHAR(50) NOT NULL,
        localizacao VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        imagem_url VARCHAR(500),
        data_identificacao DATE NOT NULL,
        prioridade VARCHAR(20) NOT NULL DEFAULT 'media',
        status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    await pool.query(createTableQuery)
    console.log('✅ Tabela pendencias criada com sucesso!')

    // Criar índices para melhor performance
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_pendencias_pep ON pendencias(pep);',
      'CREATE INDEX IF NOT EXISTS idx_pendencias_status ON pendencias(status);',
      'CREATE INDEX IF NOT EXISTS idx_pendencias_prioridade ON pendencias(prioridade);',
      'CREATE INDEX IF NOT EXISTS idx_pendencias_data ON pendencias(data_identificacao);',
    ]

    for (const indexQuery of indexQueries) {
      await pool.query(indexQuery)
    }

    console.log('✅ Índices criados com sucesso!')

    // Inserir alguns dados de exemplo (opcional)
    const insertExampleData = `
      INSERT INTO pendencias (pep, tipo_pendencia, localizacao, descricao, data_identificacao, prioridade) 
      VALUES 
        ('PEP-001', 'material', 'Setor A - Sala 101', 'Falta material para finalizar instalação elétrica', CURRENT_DATE, 'alta'),
        ('PEP-002', 'seguranca', 'Canteiro de obras', 'Equipamento de proteção individual vencido', CURRENT_DATE, 'critica'),
        ('PEP-003', 'documentacao', 'Escritório', 'Documentação técnica desatualizada', CURRENT_DATE, 'media')
      ON CONFLICT DO NOTHING;
    `

    await pool.query(insertExampleData)
    console.log('✅ Dados de exemplo inseridos!')
  } catch (error) {
    console.error('❌ Erro ao criar tabela pendencias:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Executar a migração
if (require.main === module) {
  createPendenciasTable()
    .then(() => {
      console.log('🎉 Migração concluída com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Falha na migração:', error)
      process.exit(1)
    })
}

module.exports = { createPendenciasTable }
