const express = require('express');
const router = express.Router();
const reservaService = require('../services/reservaService');

router.post('/save', (req, res) => {
    reservaService.salvar(req.body, (err, result) => {
        if (err) {
            // Erro de validação de dados básicos
            if (err.tipo === 'VALIDACAO')
                return res.status(400).json({ sucesso: false, erro: err.mensagem });

            // ERRO DE DUPLICIDADE (Onde acontece o conflito)
            if (err.code === 'ER_DUP_ENTRY') {
                // Verifica se o erro veio da restrição do PROFESSOR
                if (err.sqlMessage && err.sqlMessage.includes('unq_professor_turno')) {
                    return res.status(409).json({
                        sucesso: false,
                        erro: 'O professor não pode dar duas aulas ao mesmo tempo.'
                    });
                }
                // Caso contrário, é erro de SALA ocupada
                return res.status(409).json({
                    sucesso: false,
                    erro: 'Esta sala já está reservada para este horário.'
                });
            }

            console.error(err);
            return res.status(500).json({ sucesso: false, erro: 'Erro ao cadastrar reserva' });
        }

        return res.status(201).json({ sucesso: true, data: { id_reserva: result.insertId } });
    });
});

// CREATE BULK
router.post('/saveAll', (req, res) => {
    reservaService.salvarLote(req.body, (err, result) => {
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
    reservaService.buscarTodas((err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar reservas' });
        }

        res.json({ sucesso: true, data: rows });
    });
});


router.patch('/updateParcial/:id', (req, res) => {
    const id = req.params.id;
    const campos = req.body;

    reservaService.atualizarParcial(id, campos, (err, resultado) => {
        if (err) {
            return res.status(err.status || 500).json({
                sucesso: false,
                erro: err.erro || 'Erro ao atualizar reserva'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Reserva atualizada com sucesso',
            data: resultado
        });
    });
});

router.get('/professor/:id', (req, res) => {
    const professorId = req.params.id;
    reservaService.buscarPorProfessor(professorId, (err, resultado) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar reservas' });

        res.json({
            sucesso: true,
            data: resultado
        });
    });
});

module.exports = router;
