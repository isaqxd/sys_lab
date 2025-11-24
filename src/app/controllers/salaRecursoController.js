// src/app/controllers/salaRecursoController.js
const express = require('express');
const router = express.Router();
const salaRecursoService = require('../services/salaRecursoService');

// CREATE vínculo
router.post('/save', (req, res) => {
  const { fk_sala, fk_recurso } = req.body;

  salaRecursoService.vincular(fk_sala, fk_recurso, (err, result) => {
    if (err) {
      return res
        .status(err.status || 500)
        .json({ sucesso: false, erro: err.erro });
    }
    res.status(201).json({ sucesso: true, data: { inserted: result.affectedRows } });
  });
});

// READ recursos por sala
router.get('/findById/:salaId', (req, res) => {
  salaRecursoService.buscarPorSala(req.params.salaId, (err, rows) => {
    if (err) {
      return res
        .status(err.status || 500)
        .json({ sucesso: false, erro: err.erro });
    }
    res.json({ sucesso: true, data: rows });
  });
});

// DELETE vínculo específico (sala + recurso)
router.delete('/remove', (req, res) => {
  const { fk_sala, fk_recurso } = req.body;

  salaRecursoService.removerVinculo(fk_sala, fk_recurso, (err, result) => {
    if (err) {
      return res
        .status(err.status || 500)
        .json({ sucesso: false, erro: err.erro });
    }
    res.json({ sucesso: true, data: { deleted: result.affectedRows } });
  });
});

// DELETE todos vínculos da sala
router.delete('/deleteById/:salaId', (req, res) => {
  salaRecursoService.removerTodosPorSala(req.params.salaId, (err, result) => {
    if (err) {
      return res
        .status(err.status || 500)
        .json({ sucesso: false, erro: err.erro });
    }
    res.json({ sucesso: true, data: { deleted: result.affectedRows } });
  });
});

module.exports = router;
