// app/controllers/reserva.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// helpers
function validateReservaPayload(payload, requireAll = true) {
  const { fk_usuario, fk_sala, fk_horario, data_reserva } = payload;
  if (requireAll) {
    if (!fk_usuario || !fk_sala || !fk_horario || !data_reserva) return { ok: false, erro: 'fk_usuario, fk_sala, fk_horario e data_reserva obrigatórios' };
  }
  // basic date validation YYYY-MM-DD
  if (data_reserva && !/^\d{4}-\d{2}-\d{2}$/.test(data_reserva)) return { ok: false, erro: 'data_reserva deve ser YYYY-MM-DD' };
  return { ok: true };
}

const uniqueConflictMessage = 'Conflito: já existe reserva para essa sala ou o usuário já tem reserva nesse horário';

// CREATE (single or bulk)
router.post('/save', (req, res) => {
  if (!req.body) return res.status(400).json({ sucesso: false, erro: 'Corpo vazio' });

  if (Array.isArray(req.body)) {
    if (req.body.length === 0) return res.status(400).json({ sucesso: false, erro: 'Lista vazia' });

    const values = [];
    for (const r of req.body) {
      const v = validateReservaPayload(r, true);
      if (!v.ok) return res.status(400).json({ sucesso: false, erro: v.erro });
      values.push([r.fk_usuario, r.fk_sala, r.fk_horario, r.data_reserva, r.motivo || null, r.status || 'CONFIRMADA']);
    }

    return db.query('INSERT INTO reserva (fk_usuario, fk_sala, fk_horario, data_reserva, motivo, status) VALUES ?', [values], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: uniqueConflictMessage });
        console.error(err);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao cadastrar reservas' });
      }
      return res.status(201).json({ sucesso: true, data: { inserted: result.affectedRows } });
    });
  }

  // single
  const v = validateReservaPayload(req.body, true);
  if (!v.ok) return res.status(400).json({ sucesso: false, erro: v.erro });

  const { fk_usuario, fk_sala, fk_horario, data_reserva, motivo, status } = req.body;

  db.query('INSERT INTO reserva (fk_usuario, fk_sala, fk_horario, data_reserva, motivo, status) VALUES (?, ?, ?, ?, ?, ?)',
    [fk_usuario, fk_sala, fk_horario, data_reserva, motivo || null, status || 'CONFIRMADA'],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: uniqueConflictMessage });
        console.error(err);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao cadastrar reserva' });
      }
      return res.status(201).json({ sucesso: true, data: { id_reserva: result.insertId } });
    });
});

// READ ALL
router.get('/findAll', (req, res) => {
  db.query('SELECT * FROM reserva ORDER BY id_reserva DESC', (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    return res.json({ sucesso: true, data: rows });
  });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
  db.query('SELECT * FROM reserva WHERE id_reserva = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    if (rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Reserva não encontrada' });
    return res.json({ sucesso: true, data: rows[0] });
  });
});

// UPDATE FULL
router.put('/updateById/:id', (req, res) => {
  const v = validateReservaPayload(req.body, true);
  if (!v.ok) return res.status(400).json({ sucesso: false, erro: v.erro });

  const { fk_usuario, fk_sala, fk_horario, data_reserva, motivo, status } = req.body;

  db.query('UPDATE reserva SET fk_usuario=?, fk_sala=?, fk_horario=?, data_reserva=?, motivo=?, status=? WHERE id_reserva=?',
    [fk_usuario, fk_sala, fk_horario, data_reserva, motivo || null, status, req.params.id],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: uniqueConflictMessage });
        console.error(err);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar' });
      }
      if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Reserva não encontrada' });
      return res.json({ sucesso: true, data: { updated: result.affectedRows } });
    });
});

// UPDATE PARTIAL
router.patch('/updatePartial/:id', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ sucesso: false, erro: 'Nenhum campo enviado' });

  const allowed = ['fk_usuario','fk_sala','fk_horario','data_reserva','motivo','status'];
  const fields = [];
  const values = [];

  for (const k of Object.keys(req.body)) {
    if (!allowed.includes(k)) return res.status(400).json({ sucesso: false, erro: `Campo inválido: ${k}` });
    if (k === 'data_reserva' && !/^\d{4}-\d{2}-\d{2}$/.test(req.body[k])) return res.status(400).json({ sucesso: false, erro: 'data_reserva deve ser YYYY-MM-DD' });
    fields.push(`${k} = ?`);
    values.push(req.body[k]);
  }
  values.push(req.params.id);

  db.query(`UPDATE reserva SET ${fields.join(', ')} WHERE id_reserva = ?`, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: uniqueConflictMessage });
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Reserva não encontrada' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

// DELETE
router.delete('/deleteById/:id', (req, res) => {
  db.query('DELETE FROM reserva WHERE id_reserva = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao deletar' });
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Reserva não encontrada' });
    return res.json({ sucesso: true, data: { deleted: result.affectedRows } });
  });
});

module.exports = router;
