const express = require('express');
const router = express.Router();
const db = require('../db');



router.post('/save', (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Corpo da requisição vazio' });
    }

    if (Array.isArray(req.body)) {
        const slotReserva = req.body;
        const values = slotReserva.map(sr => [sr.fk_reserva_id, sr.fk_horario_disponivel_id]);
        const query = 'INSERT INTO slot_reserva (fk_reserva_id, fk_horario_disponivel) VALUES ?';

        return db.query(query, [values], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao cadastrar status reserva' });
            }
            return res.status(201).json({
                message: `${result.affectedRows} status reserva cadastrados com sucesso`
            });
        });
    }

    const { fk_reserva_id, fk_horario_disponivel_id} = req.body;
    const query = 'INSERT INTO slot_reserva (fk_reserva_id, fk_horario_disponivel) VALUES (?, ?)';
    db.query(query, [fk_reserva_id, fk_horario_disponivel_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao cadastrar status reserva' });
        res.status(201).json({ message: 'Status reserva cadastrado com sucesso', recursoId: result.insertId });
    });
});

router.get('/findAll', (req, res) => {
    const query = 'SELECT * FROM slot_reserva';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar Status reserva' });
        res.status(200).json(results);
    });
});

router.get('/findById/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM slot_reserva WHERE id_slot_reserva = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar Status reserva' });
        if (results.length === 0) return res.status(404).json({ message: 'Status reserva não encontrado' });
        res.status(200).json(results[0]);
    });
});

router.put('/updateById/:id', (req, res) => {
    const { id } = req.params;
    const { descricao } = req.body;
    const query = 'UPDATE slot_reserva SET fk_reserva_id = ?, fk_horario_id = ? WHERE id_slot_reserva = ?';
    db.query(query, [descricao, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar Status reserva' });
        res.status(200).json({ message: 'Status reserva atualizado com sucesso' });
    });
});

router.patch('/updatePartial/:id', (req, res) => {
    const { id } = req.params;
    const fields = [];
    const values = [];
    for (const key in req.body) {
        fields.push(`${key} = ?`);
        values.push(req.body[key]);
    }
    const query = `UPDATE slot_reserva SET ${fields.join(', ')} WHERE id_slot_reserva = ?`;
    values.push(id);
    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar Status reserva' });
        res.status(200).json({ message: 'Status reserva atualizado com sucesso' });
    });
});

router.delete('/deleteById/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM slot_reserva WHERE id_slot_reserva = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao deletar Status reserva' });
        res.status(200).json({ message: 'Status reserva deletado com sucesso' });
    });
});

module.exports = router;