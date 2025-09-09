const pool = require('../config/database');

const createTables = async () => {
  try {
    // Tabela de usuários/clientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de requisições
    await pool.query(`
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
    `);

    // Índices para melhor performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requisicoes_usuario_id ON requisicoes(usuario_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requisicoes_created_at ON requisicoes(created_at);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_materiais_requisicao_id ON requisicao_materiais(requisicao_id);
    `);

    console.log('✅ Tabelas criadas com sucesso!');
    
    // Inserir dados de exemplo
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  }
};

const insertSampleData = async () => {
  try {
    // Verificar se já existem dados
    const existingUsers = await pool.query('SELECT COUNT(*) FROM usuarios');
    
    if (parseInt(existingUsers.rows[0].count) === 0) {
      // Inserir usuários de exemplo
      const users = [
        'Maria Silva',
        'João Santos', 
        'Ana Costa',
        'Pedro Oliveira',
        'Lucia Pereira'
      ];

      for (const nome of users) {
        await pool.query(
          'INSERT INTO usuarios (nome_completo, email) VALUES ($1, $2)',
          [nome, `${nome.toLowerCase().replace(' ', '.')}@empresa.com`]
        );
      }

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
        }
      ];

      for (const req of sampleRequisicoes) {
        const reqResult = await pool.query(
          'INSERT INTO requisicoes (usuario_id, nome_solicitante, observacoes) VALUES ($1, $2, $3) RETURNING id',
          [req.usuario_id, req.nome_solicitante, req.observacoes]
        );

        const requisicaoId = reqResult.rows[0].id;

        for (const material of req.materiais) {
          await pool.query(
            'INSERT INTO requisicao_materiais (requisicao_id, descricao, quantidade, unidade) VALUES ($1, $2, $3, $4)',
            [requisicaoId, material.descricao, material.quantidade, material.unidade]
          );
        }
      }

      console.log('✅ Dados de exemplo inseridos com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error);
  }
};

module.exports = { createTables };
