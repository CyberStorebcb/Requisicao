const pool = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando criação das tabelas...');

    // Tabela de usuários/clientes
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela usuarios criada');

    // Tabela de requisições
    await client.query(`
      CREATE TABLE IF NOT EXISTS requisicoes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        nome_solicitante VARCHAR(255) NOT NULL,
        observacoes TEXT,
        status VARCHAR(50) DEFAULT 'Pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela requisicoes criada');

    // Tabela de materiais da requisição
    await client.query(`
      CREATE TABLE IF NOT EXISTS requisicao_materiais (
        id SERIAL PRIMARY KEY,
        requisicao_id INTEGER REFERENCES requisicoes(id) ON DELETE CASCADE,
        descricao VARCHAR(500) NOT NULL,
        quantidade INTEGER NOT NULL,
        unidade VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela requisicao_materiais criada');

    // Índices para melhor performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_requisicoes_usuario_id ON requisicoes(usuario_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_requisicoes_created_at ON requisicoes(created_at);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_materiais_requisicao_id ON requisicao_materiais(requisicao_id);
    `);
    console.log('✅ Índices criados');

    console.log('✅ Todas as tabelas foram criadas com sucesso!');
    
    // Verificar se precisa inserir dados de exemplo
    const existingUsers = await client.query('SELECT COUNT(*) FROM usuarios');
    
    if (parseInt(existingUsers.rows[0].count) === 0) {
      console.log('🔄 Inserindo dados de exemplo...');
      await insertSampleData(client);
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  } finally {
    client.release();
  }
};

const insertSampleData = async (client) => {
  try {
    // Inserir usuários de exemplo
    const users = [
      { nome: 'Maria Silva', email: 'maria.silva@empresa.com' },
      { nome: 'João Santos', email: 'joao.santos@empresa.com' },
      { nome: 'Ana Costa', email: 'ana.costa@empresa.com' },
      { nome: 'Pedro Oliveira', email: 'pedro.oliveira@empresa.com' },
      { nome: 'Lucia Pereira', email: 'lucia.pereira@empresa.com' }
    ];

    for (const user of users) {
      await client.query(
        'INSERT INTO usuarios (nome_completo, email) VALUES ($1, $2)',
        [user.nome, user.email]
      );
    }
    console.log('✅ Usuários de exemplo inseridos');

    // Inserir algumas requisições de exemplo
    const sampleRequisicoes = [
      {
        usuario_id: 1,
        nome_solicitante: 'Maria Silva',
        observacoes: 'Materiais para escritório',
        materiais: [
          { descricao: 'Papel A4', quantidade: 5, unidade: 'pacotes' },
          { descricao: 'Canetas azuis', quantidade: 10, unidade: 'unidades' }
        ]
      },
      {
        usuario_id: 2,
        nome_solicitante: 'João Santos',
        observacoes: 'Material de limpeza',
        materiais: [
          { descricao: 'Álcool gel', quantidade: 2, unidade: 'litros' },
          { descricao: 'Papel toalha', quantidade: 6, unidade: 'pacotes' }
        ]
      },
      {
        usuario_id: 3,
        nome_solicitante: 'Ana Costa',
        observacoes: 'Materiais de informática',
        materiais: [
          { descricao: 'Mouse USB', quantidade: 2, unidade: 'unidades' },
          { descricao: 'Teclado', quantidade: 1, unidade: 'unidade' }
        ]
      }
    ];

    for (const req of sampleRequisicoes) {
      const reqResult = await client.query(
        'INSERT INTO requisicoes (usuario_id, nome_solicitante, observacoes) VALUES ($1, $2, $3) RETURNING id',
        [req.usuario_id, req.nome_solicitante, req.observacoes]
      );

      const requisicaoId = reqResult.rows[0].id;

      for (const material of req.materiais) {
        await client.query(
          'INSERT INTO requisicao_materiais (requisicao_id, descricao, quantidade, unidade) VALUES ($1, $2, $3, $4)',
          [requisicaoId, material.descricao, material.quantidade, material.unidade]
        );
      }
    }

    console.log('✅ Requisições de exemplo inseridas');
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error);
    throw error;
  }
};

module.exports = { createTables };
