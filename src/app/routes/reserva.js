const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/save', (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ error: 'Corpo da requisição vazio' });
    if (Array.isArray(req.body)) {
        const reserva = req.body;
        const values = reserva.map(r => [r.data_reserva, r.fk_usuario_id, r.fk_sala_id]);
        const query = 'INSERT INTO reserva (data_reserva, fk_usuario_id, fk_sala_id) VALUES ?';

        return db.query(query, [values], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao cadastrar reserva.' });
            }
            return res.status(201).json({
                message: `${result.affectedRows} Reservas cadastradas com sucesso.`
            });
        });
    };

    const { data_reserva, fk_usuario_id, fk_sala_id } = req.body;
    const query = 'INSERT INTO reserva (data_reserva, fk_usuario_id, fk_sala_id) VALUES (?, ?, ?)';
    db.query(query, [data_reserva, fk_usuario_id, fk_sala_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao cadastrar reserva.' });
        res.status(201).json({ message: 'Reserva cadastrada com sucesso', recursoId: result.insertId });
    });
});

router.get('/findAll', (req, res) => {
    const query = 'SELECT * FROM reserva';
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar reservas' });
        res.status(200).json(result);
    });
});

router.get('/findById/:id', (req, res) => {
    const { id } = req.body;
    const query = 'SELECT * FROM reserva WHERE id_reserva = ?';

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar reserva' });
        if (results.length === 0) return res.status(404).json({ message: 'Reserva não encontrada' });
        res.status(200).json(results[0]);
    });
});

router.put('/updateById/:id', (req, res) => {
    const { id } = req.params;
    const { data_reserva, fk_usuario_id, fk_sala_id } = req.body;
    const query = 'UPDATE reserva SET data_reserva = ?, fk_usuario_id = ?, fk_sala_id = ? WHERE id_reserva = ?';

    db.query(query, [data_reserva, fk_usuario_id, fk_sala_id, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar reserva' });
        res.status(200).json({ message: 'Reserva atualizada com sucesso' });
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

    const query = `UPDATE reserva SET ${fields.join(', ')} WHERE id_reserva = ?`;
    values.push(id);
    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar reserva' });
        res.status(200).json({ message: 'Reserva atualizado com sucesso' });
    });
});

router.delete('/deleteById/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM reserva WHERE id_reserva = ?';

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao deletar reserva' });
        res.status(200).json({ message: 'Reserva deletada com sucesso' })
    });
});

module.exports = router;