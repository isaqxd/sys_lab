const express = require('express');
const router = express.Router();
const horarioService = require('../services/horarioService');

// CREATE
router.post('/save', (req, res) => {
    horarioService.salvarHorario(req.body, (err, result) => {
        if (err) return res.status(err.status || 500).json({ sucesso: false, erro: err.erro || 'Erro ao salvar horário' });

        const response = Array.isArray(req.body)
            ? { inserted: result.affectedRows }
            : { id_horario: result.insertId };

        res.status(201).json({ sucesso: true, data: response });
    });
});

// READ ALL
router.get('/findAll', (req, res) => {
    horarioService.buscarTodos((err, rows) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar horários' });
        res.json({ sucesso: true, data: rows });
    });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
    horarioService.buscarPorId(req.params.id, (err, rows) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar horário' });
        if (!rows || rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Horário não encontrado' });
        res.json({ sucesso: true, data: rows[0] });
    });
});

// UPDATE FULL
router.put('/updateById/:id', (req, res) => {
    horarioService.atualizarHorario(req.params.id, req.body, (err, result) => {
        if (err) return res.status(err.status || 500).json({ sucesso: false, erro: err.erro || 'Erro ao atualizar horário' });
        if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Horário não encontrado' });
        res.json({ sucesso: true, data: { updated: result.affectedRows } });
    });
});

// UPDATE PARCIAL
router.patch('/updatePartial/:id', (req, res) => {
    horarioService.atualizarParcial(req.params.id, req.body, (err, result) => {
        if (err) return res.status(err.status || 500).json({ sucesso: false, erro: err.erro || 'Erro ao atualizar horário' });
        if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Horário não encontrado' });
        res.json({ sucesso: true, data: { updated: result.affectedRows } });
    });
});

// DELETE
router.delete('/deleteById/:id', (req, res) => {
    horarioService.deletar(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao deletar horário' });
        if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Horário não encontrado' });
        res.json({ sucesso: true, data: { deleted: result.affectedRows } });
    });
});

module.exports = router;
