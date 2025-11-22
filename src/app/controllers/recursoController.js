// app/controllers/recursoController.js
const express = require('express');
const router = express.Router();
const recursoService = require('../services/recursoService');

// CREATE (single ou múltiplo)
router.post('/save', (req, res) => {
    recursoService.salvarRecurso(req.body, (err, result) => {
        if (err) return res.status(err.status || 500).json({ sucesso: false, erro: err.erro || 'Erro ao salvar recurso' });

        const response = Array.isArray(req.body)
            ? { inserted: result.affectedRows }
            : { id_recurso: result.insertId };

        res.status(201).json({ sucesso: true, data: response });
    });
});

// READ ALL
router.get('/findAll', (req, res) => {
    recursoService.buscarTodos((err, results) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar recursos' });
        res.json({ sucesso: true, data: results });
    });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
    recursoService.buscarPorId(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar recurso' });
        if (!result || result.length === 0) return res.status(404).json({ sucesso: false, erro: 'Recurso não encontrado' });
        res.json({ sucesso: true, data: result[0] });
    });
});

// UPDATE FULL
router.put('/updateById/:id', (req, res) => {
    recursoService.atualizarPorId(req.params.id, req.body, (err, result) => {
        if (err) return res.status(err.status || 500).json({ sucesso: false, erro: err.erro || 'Erro ao atualizar recurso' });
        if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Recurso não encontrado' });
        res.json({ sucesso: true, data: { updated: result.affectedRows } });
    });
});

// UPDATE PARCIAL
router.patch('/updatePartial/:id', (req, res) => {
    recursoService.atualizarParcial(req.params.id, req.body, (err, result) => {
        if (err) return res.status(err.status || 500).json({ sucesso: false, erro: err.erro || 'Erro ao atualizar recurso' });
        if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Recurso não encontrado' });
        res.json({ sucesso: true, data: { updated: result.affectedRows } });
    });
});

// DELETE
router.delete('/deleteById/:id', (req, res) => {
    recursoService.deletar(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao deletar recurso' });
        if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Recurso não encontrado' });
        res.json({ sucesso: true, data: { deleted: result.affectedRows } });
    });
});

module.exports = router;
