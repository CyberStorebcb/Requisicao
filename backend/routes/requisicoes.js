const express = require('express')
const { body, validationResult } = require('express-validator')
const pool = require('../config/database')
require('dotenv').config()
// Middleware para checar senha de admin
function checkAdminPassword(req, res, next) {
  const senha = req.body.senha || req.query.senha
  if (!senha || senha !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Senha administrativa inválida' })
  }
  next()
}

const router = express.Router()

// GET - Listar todas as requisições
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        r.id,
        r.nome_solicitante,
        r.data_requisicao,
        r.observacoes,
        r.status,
        r.created_at,
        r.updated_at,
        COUNT(rm.id) as total_materiais
      FROM requisicoes r
      LEFT JOIN requisicao_materiais rm ON r.id = rm.requisicao_id
      GROUP BY r.id, r.nome_solicitante, r.data_requisicao, r.observacoes, r.status, r.created_at, r.updated_at
      ORDER BY r.created_at DESC
    `

    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error('Erro ao buscar requisições:', error)
    res.status(500).json({ error: 'Erro ao buscar requisições' })
  }
})

// GET - Buscar uma requisição específica com materiais
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Buscar a requisição
    const reqQuery = 'SELECT * FROM requisicoes WHERE id = $1'
    const reqResult = await pool.query(reqQuery, [id])

    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Requisição não encontrada' })
    }

    // Buscar os materiais da requisição
    const matQuery = 'SELECT * FROM requisicao_materiais WHERE requisicao_id = $1'
    const matResult = await pool.query(matQuery, [id])

    const requisicao = reqResult.rows[0]
    requisicao.materiais = matResult.rows

    res.json(requisicao)
  } catch (error) {
    console.error('Erro ao buscar requisição:', error)
    res.status(500).json({ error: 'Erro ao buscar requisição' })
  }
})

// POST - Criar nova requisição
router.post(
  '/',
  [
    body('nome_solicitante').notEmpty().withMessage('Nome do solicitante é obrigatório'),
    body('data_requisicao').isISO8601().toDate().withMessage('Data da requisição deve ser válida'),
    body('materiais').isArray({ min: 1 }).withMessage('Pelo menos um material deve ser informado'),
    body('materiais.*.descricao').notEmpty().withMessage('Descrição do material é obrigatória'),
    body('materiais.*.quantidade')
      .isInt({ min: 1 })
      .withMessage('Quantidade deve ser um número inteiro positivo'),
  ],
  async (req, res) => {
    try {
      // Verificar erros de validação
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { nome_solicitante, data_requisicao, observacoes, materiais } = req.body

      // Validar se a data é segunda, quarta ou sexta-feira
      const dataReq = new Date(data_requisicao)
      const dayOfWeek = dataReq.getDay()
      const allowedDays = [1, 3, 5] // Segunda, Quarta, Sexta

      if (!allowedDays.includes(dayOfWeek)) {
        return res.status(400).json({
          error: 'Requisições só são permitidas nas segundas, quartas e sextas-feiras',
        })
      }

      // Iniciar transação
      const client = await pool.connect()

      try {
        await client.query('BEGIN')

        // Inserir a requisição
        const reqQuery = `
        INSERT INTO requisicoes (nome_solicitante, data_requisicao, observacoes)
        VALUES ($1, $2, $3)
        RETURNING id
      `
        const reqResult = await client.query(reqQuery, [
          nome_solicitante,
          data_requisicao,
          observacoes || null,
        ])
        const requisicaoId = reqResult.rows[0].id

        // Inserir os materiais
        for (const material of materiais) {
          const matQuery = `
          INSERT INTO requisicao_materiais (requisicao_id, descricao, quantidade, unidade)
          VALUES ($1, $2, $3, $4)
        `
          await client.query(matQuery, [
            requisicaoId,
            material.descricao,
            material.quantidade,
            material.unidade || null,
          ])
        }

        await client.query('COMMIT')

        res.status(201).json({
          message: 'Requisição criada com sucesso!',
          id: requisicaoId,
        })
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Erro ao criar requisição:', error)
      res.status(500).json({ error: 'Erro ao criar requisição' })
    }
  },
)

// PUT - Atualizar status da requisição
router.put(
  '/:id/status',
  [
    body('status')
      .isIn(['Pendente', 'Aprovado', 'Rejeitado', 'Concluída'])
      .withMessage('Status inválido'),
  ],
  checkAdminPassword,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { status } = req.body

      const query = `
      UPDATE requisicoes
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `

      const result = await pool.query(query, [status, id])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Requisição não encontrada' })
      }

      res.json({ message: 'Status atualizado com sucesso!', requisicao: result.rows[0] })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      res.status(500).json({ error: 'Erro ao atualizar status' })
    }
  },
)

// GET - Ranking de solicitantes
router.get('/stats/ranking', async (req, res) => {
  try {
    const query = `
      SELECT
        nome_solicitante,
        COUNT(r.id) as total_requisicoes,
        SUM(
          (SELECT COUNT(*) FROM requisicao_materiais WHERE requisicao_id = r.id)
        ) as total_materiais,
        MAX(r.created_at) as ultima_requisicao
      FROM requisicoes r
      GROUP BY nome_solicitante
      ORDER BY total_requisicoes DESC, total_materiais DESC
    `

    const result = await pool.query(query)

    // Adicionar posição no ranking
    const ranking = result.rows.map((row, index) => ({
      ...row,
      posicao: index + 1,
    }))

    res.json(ranking)
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    res.status(500).json({ error: 'Erro ao buscar ranking' })
  }
})

// DELETE - Remover requisição
router.delete('/:id', checkAdminPassword, async (req, res) => {
  try {
    const { id } = req.params

    const query = 'DELETE FROM requisicoes WHERE id = $1 RETURNING *'
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Requisição não encontrada' })
    }

    res.json({ message: 'Requisição removida com sucesso!' })
  } catch (error) {
    console.error('Erro ao remover requisição:', error)
    res.status(500).json({ error: 'Erro ao remover requisição' })
  }
})

// PUT - Editar requisição (nome_solicitante, data_requisicao, observacoes)
router.put('/:id', checkAdminPassword, async (req, res) => {
  try {
    const { id } = req.params
    const { nome_solicitante, data_requisicao, observacoes } = req.body
    const query = `UPDATE requisicoes SET nome_solicitante = $1, data_requisicao = $2, observacoes = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`
    const result = await pool.query(query, [nome_solicitante, data_requisicao, observacoes, id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Requisição não encontrada' })
    }
    res.json({ message: 'Requisição editada com sucesso!', requisicao: result.rows[0] })
  } catch (error) {
    console.error('Erro ao editar requisição:', error)
    res.status(500).json({ error: 'Erro ao editar requisição' })
  }
})

module.exports = router
