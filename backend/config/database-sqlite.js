const sqlite3 = require('sqlite3').verbose()
const path = require('path')
require('dotenv').config()

// Usar SQLite para desenvolvimento local
const dbPath = path.join(__dirname, '..', 'database.sqlite')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com SQLite:', err)
  } else {
    console.log('✅ Conectado ao banco de dados SQLite')
    initializeTables()
  }
})

function initializeTables() {
  // Criar tabelas se não existirem
  db.serialize(() => {
    // Tabela de usuários
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_completo TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de requisições
    db.run(`
      CREATE TABLE IF NOT EXISTS requisicoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        nome_solicitante TEXT NOT NULL,
        chapa_solicitante TEXT,
        data_requisicao DATE,
        observacoes TEXT,
        status TEXT DEFAULT 'pendente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `)

    // Tabela de materiais da requisição
    db.run(`
      CREATE TABLE IF NOT EXISTS requisicao_materiais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requisicao_id INTEGER NOT NULL,
        descricao TEXT NOT NULL,
        quantidade INTEGER NOT NULL,
        unidade TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requisicao_id) REFERENCES requisicoes(id) ON DELETE CASCADE
      )
    `)

    // Tabela de pendências
    db.run(`
      CREATE TABLE IF NOT EXISTS pendencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pep TEXT NOT NULL,
        tipo_pendencia TEXT NOT NULL,
        localizacao TEXT NOT NULL,
        descricao TEXT,
        data_identificacao DATE,
        prioridade TEXT DEFAULT 'media',
        imagem_path TEXT,
        status TEXT DEFAULT 'aberta',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Tabelas SQLite criadas/verificadas com sucesso!')

    // Inserir dados de exemplo se não existirem
    insertSampleData()
  })
}

function insertSampleData() {
  // Verificar se já existem requisições
  db.get('SELECT COUNT(*) as count FROM requisicoes', (err, row) => {
    if (err) {
      console.error('Erro ao verificar dados:', err)
      return
    }

    if (row.count === 0) {
      // Inserir requisições de exemplo
      const sampleRequisicoes = [
        {
          nome: 'ITALO BRUNO DA SILVA FONTES',
          chapa: '12690',
          data: '2025-08-14',
          obs: 'Materiais para escritório',
          materiais: [
            { desc: 'Papel A4', qty: 5, unit: 'pacotes' },
            { desc: 'Canetas azuis', qty: 10, unit: 'unidades' },
          ],
        },
        {
          nome: 'MARIA SILVA DOS SANTOS',
          chapa: '12300',
          data: '2025-08-16',
          obs: 'Material de limpeza',
          materiais: [
            { desc: 'Detergente', qty: 2, unit: 'frascos' },
            { desc: 'Papel toalha', qty: 6, unit: 'rolos' },
          ],
        },
      ]

      sampleRequisicoes.forEach((req) => {
        db.run(
          'INSERT INTO requisicoes (nome_solicitante, chapa_solicitante, data_requisicao, observacoes) VALUES (?, ?, ?, ?)',
          [req.nome, req.chapa, req.data, req.obs],
          function (err) {
            if (err) {
              console.error('Erro ao inserir requisição:', err)
              return
            }

            const requisicaoId = this.lastID

            // Inserir materiais
            req.materiais.forEach((mat) => {
              db.run(
                'INSERT INTO requisicao_materiais (requisicao_id, descricao, quantidade, unidade) VALUES (?, ?, ?, ?)',
                [requisicaoId, mat.desc, mat.qty, mat.unit],
              )
            })
          },
        )
      })

      console.log('✅ Dados de exemplo inseridos!')
    }
  })
}

// Wrapper para compatibilidade com pool.query do PostgreSQL
const pool = {
  query: (text, params, callback) => {
    if (typeof params === 'function') {
      callback = params
      params = []
    }

    if (text.includes('RETURNING')) {
      // Para comandos INSERT que precisam retornar o ID
      db.run(text.replace(/RETURNING \w+/i, ''), params, function (err) {
        if (callback) {
          if (err) {
            callback(err)
          } else {
            callback(null, { rows: [{ id: this.lastID }] })
          }
        }
      })
    } else if (text.trim().toLowerCase().startsWith('select')) {
      // Para comandos SELECT
      db.all(text, params, (err, rows) => {
        if (callback) {
          if (err) {
            callback(err)
          } else {
            callback(null, { rows: rows || [] })
          }
        }
      })
    } else {
      // Para comandos UPDATE, DELETE, etc.
      db.run(text, params, function (err) {
        if (callback) {
          if (err) {
            callback(err)
          } else {
            callback(null, { rowCount: this.changes })
          }
        }
      })
    }
  },
}

module.exports = pool
