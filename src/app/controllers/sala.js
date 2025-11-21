// app/controllers/sala.js
const express = require('express');
const router = express.Router();
const db = require('../db');

const VALID_STATUS = ['DISPONIVEL', 'MANUTENCAO', 'OCUPADA', 'DESATIVADA'];

function validateSalaPayload(payload, requireAll = true) {
  const { nome, capacidade, status } = payload;
  if (requireAll) {
    if (!nome || capacidade === undefined) return { ok: false, erro: 'nome e capacidade obrigatórios' };
  }
  if (status && !VALID_STATUS.includes(status)) return { ok: false, erro: `status inválido: ${VALID_STATUS.join(', ')}` };
  if (capacidade !== undefined && (!Number.isInteger(capacidade) || capacidade < 0)) return { ok: false, erro: 'capacidade deve ser inteiro >= 0' };
  return { ok: true };
}

// CREATE
router.post('/save', (req, res) => {
  if (!req.body) return res.status(400).json({ sucesso: false, erro: 'Corpo vazio' });

  if (Array.isArray(req.body)) {
    if (req.body.length === 0) return res.status(400).json({ sucesso: false, erro: 'Lista vazia' });
    const values = [];
    for (const s of req.body) {
      const v = validateSalaPayload(s, true);
      if (!v.ok) return res.status(400).json({ sucesso: false, erro: v.erro });
      values.push([s.nome, s.capacidade, s.status ?? 'DISPONIVEL']);
    }
    return db.query('INSERT INTO sala (nome, capacidade, status) VALUES ?', [values], (err, result) => {
      if (err) { console.error(err); return res.status(500).json({ sucesso: false, erro: 'Erro ao inserir' }); }
      return res.status(201).json({ sucesso: true, data: { inserted: result.affectedRows } });
    });
  }

  const v = validateSalaPayload(req.body, true);
  if (!v.ok) return res.status(400).json({ sucesso: false, erro: v.erro });

  const { nome, capacidade, status } = req.body;
  db.query('INSERT INTO sala (nome, capacidade, status) VALUES (?, ?, ?)', [nome, capacidade, status ?? 'DISPONIVEL'], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ sucesso: false, erro: 'Erro ao cadastrar sala' }); }
    return res.status(201).json({ sucesso: true, data: { id_sala: result.insertId } });
  });
});

// READ ALL
router.get('/findAll', (req, res) => {
  db.query('SELECT * FROM sala ORDER BY id_sala', (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    return res.json({ sucesso: true, data: rows });
  });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
  db.query('SELECT * FROM sala WHERE id_sala = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    if (rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Sala não encontrada' });
    return res.json({ sucesso: true, data: rows[0] });
  });
});

// UPDATE FULL
router.put('/updateById/:id', (req, res) => {
  const v = validateSalaPayload(req.body, true);
  if (!v.ok) return res.status(400).json({ sucesso: false, erro: v.erro });

  const { nome, capacidade, status } = req.body;
  db.query('UPDATE sala SET nome = ?, capacidade = ?, status = ? WHERE id_sala = ?', [nome, capacidade, status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar' });
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Sala não encontrada' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

// UPDATE PARTIAL
router.patch('/updatePartial/:id', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ sucesso: false, erro: 'Nenhum campo enviado' });
  const allowed = ['nome', 'capacidade', 'status'];
  const fields = [];
  const values = [];
  for (const k of Object.keys(req.body)) {
    if (!allowed.includes(k)) return res.status(400).json({ sucesso: false, erro: `Campo inválido: ${k}` });
    const v = validateSalaPayload({ [k]: req.body[k], capacidade: req.body.capacidade ?? undefined }, false);
    if (!v.ok) return res.status(400).json({ sucesso: false, erro: v.erro });
    fields.push(`${k} = ?`);
    values.push(req.body[k]);
  }
  values.push(req.params.id);
  db.query(`UPDATE sala SET ${fields.join(', ')} WHERE id_sala = ?`, values, (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar' });
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Sala não encontrada' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

// "DELETE" = desativar
router.delete('/deleteById/:id', (req, res) => {
  db.query("UPDATE sala SET status = 'DESATIVADA' WHERE id_sala = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao desativar' });
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Sala não encontrada' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

module.exports = router;
