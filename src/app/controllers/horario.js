// app/controllers/horario.js
const express = require('express');
const router = express.Router();
const db = require('../db');

const TURNOS = ['MANHA', 'TARDE', 'NOITE'];
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const toSeconds = h => {
  const [hh, mm, ss = '00'] = h.split(':').map(Number);
  return hh * 3600 + mm * 60 + ss;
};
const normalizeTime = t => {
  if (!t) return null;
  if (!timeRegex.test(t)) return null;
  return /^\d{2}:\d{2}$/.test(t) ? t + ':00' : t;
};
const handleDbError = (err, res, msg = 'Erro no banco de dados') => {
  if (!err) return;
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: 'Turno já cadastrado' });
  console.error(err);
  return res.status(500).json({ sucesso: false, erro: msg });
};

// CREATE (single or bulk)
router.post('/save', (req, res) => {
  if (!req.body) return res.status(400).json({ sucesso: false, erro: 'Corpo vazio' });

  if (Array.isArray(req.body)) {
    if (req.body.length === 0) return res.status(400).json({ sucesso: false, erro: 'Array vazio' });

    const turnos = req.body.map(i => i.turno);
    const dup = turnos.filter((v, i, a) => a.indexOf(v) !== i);
    if (dup.length) return res.status(400).json({ sucesso: false, erro: `Turnos duplicados: ${[...new Set(dup)].join(', ')}` });

    const values = [];
    for (const it of req.body) {
      const { turno, hora_inicio, hora_fim } = it;
      if (!turno || !hora_inicio || !hora_fim) return res.status(400).json({ sucesso: false, erro: 'turno, hora_inicio e hora_fim obrigatórios' });
      if (!TURNOS.includes(turno)) return res.status(400).json({ sucesso: false, erro: `Turno inválido: ${turno}` });

      const hi = normalizeTime(hora_inicio);
      const hf = normalizeTime(hora_fim);
      if (!hi || !hf) return res.status(400).json({ sucesso: false, erro: 'Formato de hora inválido' });
      if (toSeconds(hi) >= toSeconds(hf)) return res.status(400).json({ sucesso: false, erro: 'hora_inicio deve ser menor que hora_fim' });

      values.push([turno, hi, hf]);
    }

    return db.query('INSERT INTO horario (turno, hora_inicio, hora_fim) VALUES ?', [values], (err, result) => {
      if (err) return handleDbError(err, res, 'Erro ao cadastrar múltiplos horários');
      return res.status(201).json({ sucesso: true, data: { inserted: result.affectedRows } });
    });
  }

  // single
  const { turno, hora_inicio, hora_fim } = req.body;
  if (!turno || !hora_inicio || !hora_fim) return res.status(400).json({ sucesso: false, erro: 'turno, hora_inicio e hora_fim obrigatórios' });
  if (!TURNOS.includes(turno)) return res.status(400).json({ sucesso: false, erro: `Turno inválido: ${TURNOS.join(', ')}` });

  const hi = normalizeTime(hora_inicio);
  const hf = normalizeTime(hora_fim);
  if (!hi || !hf) return res.status(400).json({ sucesso: false, erro: 'Formato de hora inválido' });
  if (toSeconds(hi) >= toSeconds(hf)) return res.status(400).json({ sucesso: false, erro: 'hora_inicio deve ser menor que hora_fim' });

  db.query('INSERT INTO horario (turno, hora_inicio, hora_fim) VALUES (?, ?, ?)', [turno, hi, hf], (err, result) => {
    if (err) return handleDbError(err, res, 'Erro ao cadastrar horário');
    return res.status(201).json({ sucesso: true, data: { id_horario: result.insertId } });
  });
});

// READ ALL
router.get('/findAll', (req, res) => {
  db.query('SELECT * FROM horario ORDER BY id_horario ASC', (err, results) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar horários' });
    return res.json({ sucesso: true, data: results });
  });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
  db.query('SELECT * FROM horario WHERE id_horario = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar horário' });
    if (results.length === 0) return res.status(404).json({ sucesso: false, erro: 'Horário não encontrado' });
    return res.json({ sucesso: true, data: results[0] });
  });
});

// DELETE
router.delete('/deleteById/:id', (req, res) => {
  db.query('DELETE FROM horario WHERE id_horario = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao deletar horário' });
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Horário não encontrado' });
    return res.json({ sucesso: true, data: { deleted: result.affectedRows } });
  });
});

// PUT - full update
router.put('/updateById/:id', (req, res) => {
  const { turno, hora_inicio, hora_fim } = req.body;
  if (!turno || !hora_inicio || !hora_fim) return res.status(400).json({ sucesso: false, erro: 'turno, hora_inicio e hora_fim obrigatórios' });
  if (!TURNOS.includes(turno)) return res.status(400).json({ sucesso: false, erro: `Turno inválido: ${TURNOS.join(', ')}` });

  const hi = normalizeTime(hora_inicio);
  const hf = normalizeTime(hora_fim);
  if (!hi || !hf) return res.status(400).json({ sucesso: false, erro: 'Formato de hora inválido' });
  if (toSeconds(hi) >= toSeconds(hf)) return res.status(400).json({ sucesso: false, erro: 'hora_inicio deve ser menor que hora_fim' });

  db.query('UPDATE horario SET turno = ?, hora_inicio = ?, hora_fim = ? WHERE id_horario = ?', [turno, hi, hf, req.params.id], (err, result) => {
    if (err) return handleDbError(err, res, 'Erro ao atualizar horário');
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Horário não encontrado' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

// PATCH - partial update
router.patch('/updatePartial/:id', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ sucesso: false, erro: 'Nenhum campo enviado' });

  const allowed = ['turno', 'hora_inicio', 'hora_fim'];
  const fields = [];
  const values = [];

  for (const key of Object.keys(req.body)) {
    if (!allowed.includes(key)) return res.status(400).json({ sucesso: false, erro: `Campo inválido: ${key}` });
    let val = req.body[key];
    if (key === 'turno') {
      if (!TURNOS.includes(val)) return res.status(400).json({ sucesso: false, erro: `Turno inválido: ${TURNOS.join(', ')}` });
    } else {
      val = normalizeTime(val);
      if (!val) return res.status(400).json({ sucesso: false, erro: `Formato inválido de ${key}` });
    }
    fields.push(`${key} = ?`);
    values.push(val);
  }

  if (req.body.hora_inicio && req.body.hora_fim) {
    if (toSeconds(normalizeTime(req.body.hora_inicio)) >= toSeconds(normalizeTime(req.body.hora_fim))) {
      return res.status(400).json({ sucesso: false, erro: 'hora_inicio deve ser menor que hora_fim' });
    }
  }

  values.push(req.params.id);
  db.query(`UPDATE horario SET ${fields.join(', ')} WHERE id_horario = ?`, values, (err, result) => {
    if (err) return handleDbError(err, res, 'Erro ao atualizar horário');
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Horário não encontrado' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

module.exports = router;
