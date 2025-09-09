const pool = require('../config/database')

const createDatabase = async () => {
  // Primeiro, conectar ao PostgreSQL sem especificar o database
  const { Pool } = require('pg')
  const adminPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Database padrão
    password: 'teteda33',
    port: 5432,
  })

  try {
    // Criar o database se não existir
    console.log('🔧 Verificando se o database existe...')

    const dbExists = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'requisicao_db'",
    )

    if (dbExists.rows.length === 0) {
      console.log('📦 Criando database requisicao_db...')
      await adminPool.query('CREATE DATABASE requisicao_db')
      console.log('✅ Database criado com sucesso!')
    } else {
      console.log('✅ Database requisicao_db já existe!')
    }

    await adminPool.end()

    // Agora conectar ao database específico e criar as tabelas
    await createTables()
  } catch (error) {
    console.error('❌ Erro ao criar database:', error)
    await adminPool.end()
    throw error
  }
}

const createTables = async () => {
  try {
    console.log('🔧 Criando tabelas...')

    // Tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de requisições
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requisicoes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        nome_solicitante VARCHAR(255) NOT NULL,
        chapa_solicitante VARCHAR(50),
        data_requisicao DATE,
        observacoes TEXT,
        status VARCHAR(50) DEFAULT 'pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de materiais da requisição
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requisicao_materiais (
        id SERIAL PRIMARY KEY,
        requisicao_id INTEGER REFERENCES requisicoes(id) ON DELETE CASCADE,
        descricao VARCHAR(500) NOT NULL,
        quantidade INTEGER NOT NULL,
        unidade VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de pendências
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pendencias (
        id SERIAL PRIMARY KEY,
        pep VARCHAR(100) NOT NULL,
        tipo_pendencia VARCHAR(200) NOT NULL,
        localizacao VARCHAR(300) NOT NULL,
        descricao TEXT,
        data_identificacao DATE,
        prioridade VARCHAR(50) DEFAULT 'media',
        imagem_path VARCHAR(500),
        status VARCHAR(50) DEFAULT 'aberta',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar índices para melhor performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requisicoes_usuario_id ON requisicoes(usuario_id);
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requisicoes_status ON requisicoes(status);
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requisicoes_data ON requisicoes(data_requisicao);
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_materiais_requisicao_id ON requisicao_materiais(requisicao_id);
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pendencias_status ON pendencias(status);
    `)

    console.log('✅ Tabelas criadas com sucesso!')

    // Inserir dados de exemplo
    await insertSampleData()
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error)
    throw error
  }
}

const insertSampleData = async () => {
  try {
    // Verificar se já existem dados
    const existingRequisicoes = await pool.query('SELECT COUNT(*) FROM requisicoes')

    if (parseInt(existingRequisicoes.rows[0].count) === 0) {
      console.log('📝 Inserindo dados de exemplo...')

      // Inserir algumas requisições de exemplo
      const sampleRequisicoes = [
        {
          nome_solicitante: 'ITALO BRUNO DA SILVA FONTES',
          chapa_solicitante: '12690',
          data_requisicao: '2025-08-14',
          observacoes: 'Materiais para escritório',
          materiais: [
            { descricao: 'Papel A4', quantidade: 5, unidade: 'pacotes' },
            { descricao: 'Canetas azuis', quantidade: 10, unidade: 'unidades' },
            { descricao: 'Grampeador', quantidade: 1, unidade: 'unidade' },
          ],
        },
        {
          nome_solicitante: 'MARIA SILVA DOS SANTOS',
          chapa_solicitante: '12300',
          data_requisicao: '2025-08-16',
          observacoes: 'Material de limpeza para o setor',
          materiais: [
            { descricao: 'Detergente neutro', quantidade: 2, unidade: 'frascos' },
            { descricao: 'Papel toalha', quantidade: 6, unidade: 'rolos' },
            { descricao: 'Álcool em gel', quantidade: 3, unidade: 'frascos' },
          ],
        },
        {
          nome_solicitante: 'CARLOS HENRIQUE SOARES FURTADO',
          chapa_solicitante: '12679',
          data_requisicao: '2025-08-18',
          observacoes: 'Equipamentos de segurança',
          materiais: [
            { descricao: 'Capacete de segurança', quantidade: 2, unidade: 'unidades' },
            { descricao: 'Luvas de proteção', quantidade: 5, unidade: 'pares' },
          ],
        },
      ]

      for (const req of sampleRequisicoes) {
        const result = await pool.query(
          'INSERT INTO requisicoes (nome_solicitante, chapa_solicitante, data_requisicao, observacoes) VALUES ($1, $2, $3, $4) RETURNING id',
          [req.nome_solicitante, req.chapa_solicitante, req.data_requisicao, req.observacoes],
        )

        const requisicaoId = result.rows[0].id

        // Inserir materiais
        for (const mat of req.materiais) {
          await pool.query(
            'INSERT INTO requisicao_materiais (requisicao_id, descricao, quantidade, unidade) VALUES ($1, $2, $3, $4)',
            [requisicaoId, mat.descricao, mat.quantidade, mat.unidade],
          )
        }
      }

      // Inserir algumas pendências de exemplo
      const samplePendencias = [
        {
          pep: 'PEP-2025-001',
          tipo_pendencia: 'Manutenção Preventiva',
          localizacao: 'Setor A - Linha de Produção 1',
          descricao: 'Verificar e trocar filtros do sistema de ar comprimido',
          data_identificacao: '2025-08-12',
          prioridade: 'alta',
        },
        {
          pep: 'PEP-2025-002',
          tipo_pendencia: 'Segurança do Trabalho',
          localizacao: 'Almoxarifado Central',
          descricao: 'Instalar sinalização de segurança nas escadas',
          data_identificacao: '2025-08-11',
          prioridade: 'media',
        },
      ]

      for (const pend of samplePendencias) {
        await pool.query(
          'INSERT INTO pendencias (pep, tipo_pendencia, localizacao, descricao, data_identificacao, prioridade) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            pend.pep,
            pend.tipo_pendencia,
            pend.localizacao,
            pend.descricao,
            pend.data_identificacao,
            pend.prioridade,
          ],
        )
      }

      console.log('✅ Dados de exemplo inseridos com sucesso!')
    } else {
      console.log('ℹ️ Dados já existem, pulando inserção de exemplos.')
    }
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error)
    throw error
  }
}

const runMigration = async () => {
  try {
    console.log('🚀 Iniciando migração do banco de dados...')
    await createDatabase()
    console.log('🎉 Migração concluída com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('💥 Falha na migração:', error)
    process.exit(1)
  }
}

// Executar se este arquivo for chamado diretamente
if (require.main === module) {
  runMigration()
}

module.exports = { createDatabase, createTables, insertSampleData }
