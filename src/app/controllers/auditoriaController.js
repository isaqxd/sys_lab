const express = require('express');
const router = express.Router();
const auditoriaService = require('../services/auditoriaService');

// CREATE (single ou múltiplo)
router.post('/save', (req, res) => {
    auditoriaService.salvarAuditoria(req.body, (err, result) => {
        if (err) return res.status(err.status || 500).json({ sucesso: false, erro: err.erro || 'Erro ao salvar auditoria' });

        const response = Array.isArray(req.body)
            ? { inserted: result.affectedRows }
            : { id_log: result.insertId };

        res.status(201).json({ sucesso: true, data: response });
    });
});

// READ ALL
router.get('/findAll', (req, res) => {
    auditoriaService.buscarTodas((err, rows) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
        res.json({ sucesso: true, data: rows });
    });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
    auditoriaService.buscarPorId(req.params.id, (err, rows) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
        if (!rows || rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Log não encontrado' });
        res.json({ sucesso: true, data: rows[0] });
    });
});

// DELETE
router.delete('/deleteById/:id', (req, res) => {
    auditoriaService.deletar(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao deletar' });
        if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Log não encontrado' });
        res.json({ sucesso: true, data: { deleted: result.affectedRows } });
    });
});

module.exports = router;
