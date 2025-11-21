// app/controllers/auditoria.js
const express = require('express');
const router = express.Router();
const db = require('../db');

const handleDbError = (err, res) => {
  if (!err) return;
  console.error(err);
  return res.status(500).json({ sucesso: false, erro: 'Erro no banco' });
};

// CREATE (single or bulk)
router.post('/save', (req, res) => {
  if (!req.body) return res.status(400).json({ sucesso: false, erro: 'Corpo vazio' });

  if (Array.isArray(req.body)) {
    if (req.body.length === 0) return res.status(400).json({ sucesso: false, erro: 'Lista vazia' });
    const values = [];
    for (const l of req.body) {
      values.push([l.fk_usuario || null, l.acao || null, l.descricao || null]);
    }
    return db.query('INSERT INTO auditoria (fk_usuario, acao, descricao) VALUES ?', [values], (err, result) => {
      if (err) return handleDbError(err, res);
      return res.status(201).json({ sucesso: true, data: { inserted: result.affectedRows } });
    });
  }

  const { fk_usuario, acao, descricao } = req.body;
  db.query('INSERT INTO auditoria (fk_usuario, acao, descricao) VALUES (?, ?, ?)', [fk_usuario || null, acao || null, descricao || null], (err, result) => {
    if (err) return handleDbError(err, res);
    return res.status(201).json({ sucesso: true, data: { id_log: result.insertId } });
  });
});

// READ ALL
router.get('/findAll', (req, res) => {
  db.query('SELECT * FROM auditoria ORDER BY data_log DESC', (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    return res.json({ sucesso: true, data: rows });
  });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
  db.query('SELECT * FROM auditoria WHERE id_log = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    if (rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Log não encontrado' });
    return res.json({ sucesso: true, data: rows[0] });
  });
});

// DELETE
router.delete('/deleteById/:id', (req, res) => {
  db.query('DELETE FROM auditoria WHERE id_log = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao deletar' });
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Log não encontrado' });
    return res.json({ sucesso: true, data: { deleted: result.affectedRows } });
  });
});

module.exports = router;
