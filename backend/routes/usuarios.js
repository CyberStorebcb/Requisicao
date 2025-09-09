const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

const router = express.Router();

// GET - Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.nome_completo,
        u.email,
        u.created_at,
        COUNT(r.id) as total_requisicoes
      FROM usuarios u
      LEFT JOIN requisicoes r ON u.id = r.usuario_id
      GROUP BY u.id, u.nome_completo, u.email, u.created_at
      ORDER BY u.nome_completo
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// GET - Buscar usuário específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM usuarios WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// POST - Criar novo usuário
router.post('/', [
  body('nome_completo').notEmpty().withMessage('Nome completo é obrigatório'),
  body('email').isEmail().withMessage('Email deve ser válido').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome_completo, email } = req.body;

    const query = `
      INSERT INTO usuarios (nome_completo, email) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    
    const result = await pool.query(query, [nome_completo, email || null]);
    
    res.status(201).json({ 
      message: 'Usuário criado com sucesso!', 
      usuario: result.rows[0] 
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// PUT - Atualizar usuário
router.put('/:id', [
  body('nome_completo').notEmpty().withMessage('Nome completo é obrigatório'),
  body('email').isEmail().withMessage('Email deve ser válido').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { nome_completo, email } = req.body;

    const query = `
      UPDATE usuarios 
      SET nome_completo = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3 
      RETURNING *
    `;
    
    const result = await pool.query(query, [nome_completo, email || null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário atualizado com sucesso!', usuario: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// DELETE - Remover usuário
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
});

module.exports = router;
