const express = require('express');
const router = express.Router();
const service = require('../services/reservaService');

router.post('/save', (req, res) => {
    service.salvar(req.body, (err, result) => {
        if (err) {
            if (err.tipo === 'VALIDACAO')
                return res.status(400).json({ sucesso: false, erro: err.mensagem });

            if (err.code === 'ER_DUP_ENTRY')
                return res.status(409).json({ sucesso: false, erro: 'Conflito de reserva' });

            console.error(err);
            return res.status(500).json({ sucesso: false, erro: 'Erro ao cadastrar reserva' });
        }

        return res.status(201).json({ sucesso: true, data: { id_reserva: result.insertId } });
    });
});

// CREATE BULK
router.post('/saveAll', (req, res) => {
    service.salvarLote(req.body, (err, result) => {
        if (err) {
            if (err.tipo === 'VALIDACAO')
                return res.status(400).json({ sucesso: false, erro: err.mensagem });

            if (err.code === 'ER_DUP_ENTRY')
                return res.status(409).json({ sucesso: false, erro: 'Conflito de reserva' });

            console.error(err);
            return res.status(500).json({ sucesso: false, erro: 'Erro ao cadastrar reservas' });
        }

        return res.status(201).json({ sucesso: true, data: { inseridas: result.affectedRows } });
    });
});

// READ ALL
router.get('/findAll', (req, res) => {
    service.buscarTodas((err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar reservas' });
        }

        res.json({ sucesso: true, data: rows });
    });
});

module.exports = router;