const express = require('express')
const { body, validationResult } = require('express-validator')
const pool = require('../config/database')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/pendencias'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, JPG, PNG, GIF, WEBP)'))
    }
  },
})

// GET - Listar todas as pendências
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        pep,
        tipo_pendencia,
        localizacao,
        descricao,
        imagem_url,
        data_identificacao,
        prioridade,
        status,
        created_at,
        updated_at
      FROM pendencias
      ORDER BY created_at DESC
    `

    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error('Erro ao buscar pendências:', error)
    res.status(500).json({ error: 'Erro ao buscar pendências' })
  }
})

// GET - Buscar uma pendência específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const query = 'SELECT * FROM pendencias WHERE id = $1'
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pendência não encontrada' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Erro ao buscar pendência:', error)
    res.status(500).json({ error: 'Erro ao buscar pendência' })
  }
})

// POST - Criar nova pendência
router.post(
  '/',
  upload.single('imagem'),
  [
    body('pep').notEmpty().withMessage('PEP é obrigatório'),
    body('tipoPendencia').notEmpty().withMessage('Tipo de pendência é obrigatório'),
    body('localizacao').notEmpty().withMessage('Localização é obrigatória'),
    body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
    body('dataIdentificacao').isISO8601().toDate().withMessage('Data deve ser válida'),
    body('prioridade').notEmpty().withMessage('Prioridade é obrigatória'),
  ],
  async (req, res) => {
    try {
      // Verificar erros de validação
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { pep, tipoPendencia, localizacao, descricao, dataIdentificacao, prioridade } = req.body
      let imagemUrl = null

      // Se foi enviado um arquivo, salvar o caminho
      if (req.file) {
        imagemUrl = `/uploads/pendencias/${req.file.filename}`
      }

      const query = `
      INSERT INTO pendencias (
        pep, 
        tipo_pendencia, 
        localizacao, 
        descricao, 
        imagem_url, 
        data_identificacao, 
        prioridade
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id
    `

      const result = await pool.query(query, [
        pep,
        tipoPendencia,
        localizacao,
        descricao,
        imagemUrl,
        dataIdentificacao,
        prioridade,
      ])

      res.status(201).json({
        message: 'Pendência cadastrada com sucesso!',
        id: result.rows[0].id,
      })
    } catch (error) {
      console.error('Erro ao criar pendência:', error)
      res.status(500).json({ error: 'Erro ao criar pendência' })
    }
  },
)

// PUT - Atualizar status da pendência
router.put(
  '/:id/status',
  [
    body('status')
      .isIn(['Pendente', 'Em Andamento', 'Resolvida', 'Cancelada'])
      .withMessage('Status inválido'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { status } = req.body

      const query = `
      UPDATE pendencias 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `

      const result = await pool.query(query, [status, id])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pendência não encontrada' })
      }

      res.json({ message: 'Status atualizado com sucesso!', pendencia: result.rows[0] })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      res.status(500).json({ error: 'Erro ao atualizar status' })
    }
  },
)

// GET - Estatísticas de pendências
router.get('/stats/resumo', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_pendencias,
        COUNT(CASE WHEN status = 'Pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'Em Andamento' THEN 1 END) as em_andamento,
        COUNT(CASE WHEN status = 'Resolvida' THEN 1 END) as resolvidas,
        COUNT(CASE WHEN prioridade = 'critica' THEN 1 END) as criticas,
        COUNT(CASE WHEN prioridade = 'alta' THEN 1 END) as altas
      FROM pendencias
    `

    const result = await pool.query(query)
    res.json(result.rows[0])
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    res.status(500).json({ error: 'Erro ao buscar estatísticas' })
  }
})

// DELETE - Remover pendência
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Buscar a pendência para pegar o caminho da imagem
    const selectQuery = 'SELECT imagem_url FROM pendencias WHERE id = $1'
    const selectResult = await pool.query(selectQuery, [id])

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pendência não encontrada' })
    }

    const imagemUrl = selectResult.rows[0].imagem_url

    // Remover a pendência do banco
    const deleteQuery = 'DELETE FROM pendencias WHERE id = $1 RETURNING *'
    const deleteResult = await pool.query(deleteQuery, [id])

    // Se havia imagem, tentar remover do filesystem
    if (imagemUrl) {
      const imagePath = path.join(__dirname, '..', imagemUrl)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    res.json({ message: 'Pendência removida com sucesso!' })
  } catch (error) {
    console.error('Erro ao remover pendência:', error)
    res.status(500).json({ error: 'Erro ao remover pendência' })
  }
})

module.exports = router
