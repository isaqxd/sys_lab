// app/controllers/sala-recurso.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE vinculo
router.post('/save', (req, res) => {
  const { fk_sala, fk_recurso } = req.body;
  if (!fk_sala || !fk_recurso) return res.status(400).json({ sucesso: false, erro: 'fk_sala e fk_recurso obrigatórios' });

  db.query('INSERT INTO sala_recurso (fk_sala, fk_recurso) VALUES (?, ?)', [fk_sala, fk_recurso], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: 'Vínculo já existe' });
      // FK error handling could be improved: ER_NO_REFERENCED_ROW...
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao vincular' });
    }
    return res.status(201).json({ sucesso: true, data: { inserted: result.affectedRows } });
  });
});

// READ recursos por sala
router.get('/findById/:salaId', (req, res) => {
  db.query(`
    SELECT r.id_recurso, r.nome
    FROM sala_recurso sr
    JOIN recurso r ON r.id_recurso = sr.fk_recurso
    WHERE sr.fk_sala = ?
  `, [req.params.salaId], (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    return res.json({ sucesso: true, data: rows });
  });
});

// DELETE vínculo
router.delete('/remove', (req, res) => {
  const { fk_sala, fk_recurso } = req.body;
  if (!fk_sala || !fk_recurso) return res.status(400).json({ sucesso: false, erro: 'fk_sala e fk_recurso obrigatórios' });

  db.query('DELETE FROM sala_recurso WHERE fk_sala = ? AND fk_recurso = ?', [fk_sala, fk_recurso], (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao remover' });
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Vínculo não encontrado' });
    return res.json({ sucesso: true, data: { deleted: result.affectedRows } });
  });
});

// DELETE todos vínculos da sala
router.delete('/deleteById/:salaId', (req, res) => {
  db.query('DELETE FROM sala_recurso WHERE fk_sala = ?', [req.params.salaId], (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao remover' });
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Nenhum vínculo encontrado' });
    return res.json({ sucesso: true, data: { deleted: result.affectedRows } });
  });
});

module.exports = router;
