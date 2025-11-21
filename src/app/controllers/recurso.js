// app/controllers/recurso.js
const express = require('express');
const router = express.Router();
const db = require('../db');

const validateNome = nome => typeof nome === 'string' && nome.trim().length > 0;
const handleDbError = (err, res, msg = 'Erro no banco') => {
  if (!err) return;
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: 'Nome já cadastrado' });
  console.error(err);
  return res.status(500).json({ sucesso: false, erro: msg });
};

// CREATE
router.post('/save', (req, res) => {
  if (Array.isArray(req.body)) {
    if (req.body.length === 0) return res.status(400).json({ sucesso: false, erro: 'Lista vazia' });
    const values = [];
    for (const r of req.body) {
      if (!validateNome(r.nome)) return res.status(400).json({ sucesso: false, erro: 'Nome inválido em um dos itens' });
      values.push([r.nome.trim()]);
    }
    return db.query('INSERT INTO recurso (nome) VALUES ?', [values], (err, result) => {
      if (err) return handleDbError(err, res);
      return res.status(201).json({ sucesso: true, data: { inserted: result.affectedRows } });
    });
  }

  const { nome } = req.body;
  if (!validateNome(nome)) return res.status(400).json({ sucesso: false, erro: 'Nome obrigatório' });

  db.query('INSERT INTO recurso (nome) VALUES (?)', [nome.trim()], (err, result) => {
    if (err) return handleDbError(err, res);
    return res.status(201).json({ sucesso: true, data: { id_recurso: result.insertId } });
  });
});

// READ ALL
router.get('/findAll', (req, res) => {
  db.query('SELECT * FROM recurso ORDER BY id_recurso ASC', (err, results) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    return res.json({ sucesso: true, data: results });
  });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
  db.query('SELECT * FROM recurso WHERE id_recurso = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    if (results.length === 0) return res.status(404).json({ sucesso: false, erro: 'Recurso não encontrado' });
    return res.json({ sucesso: true, data: results[0] });
  });
});

// UPDATE FULL
router.put('/updateById/:id', (req, res) => {
  const { nome } = req.body;
  if (!validateNome(nome)) return res.status(400).json({ sucesso: false, erro: 'Nome obrigatório' });

  db.query('UPDATE recurso SET nome = ? WHERE id_recurso = ?', [nome.trim(), req.params.id], (err, result) => {
    if (err) return handleDbError(err, res);
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Recurso não encontrado' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

// UPDATE PARTIAL
router.patch('/updatePartial/:id', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ sucesso: false, erro: 'Nenhum campo enviado' });
  if (Object.keys(req.body).length > 1) return res.status(400).json({ sucesso: false, erro: 'Apenas o campo "nome" é atualizável' });

  const { nome } = req.body;
  if (!validateNome(nome)) return res.status(400).json({ sucesso: false, erro: 'Nome inválido' });

  db.query('UPDATE recurso SET nome = ? WHERE id_recurso = ?', [nome.trim(), req.params.id], (err, result) => {
    if (err) return handleDbError(err, res);
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Recurso não encontrado' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

// DELETE
router.delete('/deleteById/:id', (req, res) => {
  db.query('DELETE FROM recurso WHERE id_recurso = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao deletar' });
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Recurso não encontrado' });
    return res.json({ sucesso: true, data: { deleted: result.affectedRows } });
  });
});

module.exports = router;