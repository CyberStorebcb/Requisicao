const express = require('express')
const multer = require('multer')
const pool = require('../config/database')
const path = require('path')
const fs = require('fs')

const router = express.Router()

// Configuração do Multer para uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/sis')
    fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  },
})
const upload = multer({ storage })

// Adicionar registro
router.post('/', upload.single('anexo'), async (req, res) => {
  try {
    const {
      cidade,
      si,
      cp,
      cliente,
      encarregado,
      avisado,
      razao,
      programado,
      levantado,
      data1,
      data2,
      status,
      responsavel,
    } = req.body
    let anexo_nome = null
    let anexo_path = null
    if (req.file) {
      anexo_nome = req.file.originalname
      anexo_path = req.file.filename
    }
    const query = `INSERT INTO sis_registros
      (cidade, si, cp, cliente, encarregado, avisado, razao, programado, levantado, data1, data2, status, responsavel, anexo_nome, anexo_path)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`
    const values = [
      cidade,
      si,
      cp,
      cliente,
      encarregado,
      avisado,
      razao,
      programado,
      levantado,
      data1,
      data2,
      status,
      responsavel,
      anexo_nome,
      anexo_path,
    ]
    const result = await pool.query(query, values)
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao adicionar registro SIS' })
  }
})

// Listar registros
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sis_registros ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar registros SIS' })
  }
})

// Download do anexo
router.get('/anexo/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/sis', req.params.filename)
  if (fs.existsSync(filePath)) {
    res.download(filePath)
  } else {
    res.status(404).json({ error: 'Arquivo não encontrado' })
  }
})

module.exports = router
