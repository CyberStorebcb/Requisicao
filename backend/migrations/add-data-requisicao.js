const pool = require('../config/database')

const addDataRequisicaoColumn = async () => {
  try {
    console.log('🔄 Adicionando coluna data_requisicao...')

    // Verificar se a coluna já existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='requisicoes' AND column_name='data_requisicao'
    `)

    if (checkColumn.rows.length === 0) {
      // Adicionar a coluna data_requisicao
      await pool.query(`
        ALTER TABLE requisicoes 
        ADD COLUMN data_requisicao DATE
      `)
      console.log('✅ Coluna data_requisicao adicionada')

      // Atualizar registros existentes com a data de criação
      await pool.query(`
        UPDATE requisicoes 
        SET data_requisicao = DATE(created_at) 
        WHERE data_requisicao IS NULL
      `)
      console.log('✅ Registros existentes atualizados')
    } else {
      console.log('✅ Coluna data_requisicao já existe')
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error)
    throw error
  }
}

async function runMigration() {
  console.log('🚀 Iniciando migração data_requisicao...')

  try {
    await addDataRequisicaoColumn()
    console.log('✅ Migração concluída com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    process.exit(1)
  }
}

runMigration()
