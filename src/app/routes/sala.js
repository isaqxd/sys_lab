const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/save', (req, res) => {
    if (Array.isArray(req.body)) {
        const salas = req.body;
        const values = salas.map(s => [s.numero, s.capacidade, s.tipo_sala, s.localizacao]);
        const query = 'INSERT INTO sala (numero, capacidade, tipo_sala, localizacao) VALUES ?';

        db.query(query, [values], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao cadastrar múltiplas salas' });
            }
            res.status(201).json({ message: `${result.affectedRows} salas cadastradas com sucesso` });
        });
        return;
    }

    const { numero, capacidade, tipo_sala, localizacao } = req.body;
    const query = 'INSERT INTO sala (numero, capacidade, tipo_sala, localizacao) VALUES (?, ?, ?, ?)';
    db.query(query, [numero, capacidade, tipo_sala, localizacao], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao cadastrar sala' });
        res.status(201).json({ message: 'Sala cadastrada com sucesso', salaId: result.insertId });
    });
});

router.get('/findAll', (req, res) => {
    const query = 'SELECT * FROM sala';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar salas' });
        res.status(200).json(results);
    });
});

router.get('/findById/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM sala WHERE id_sala = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar sala' });
        if (results.length === 0) return res.status(404).json({ message: 'Sala não encontrada' });
        res.status(200).json(results[0]);
    });
});

router.put('/updateById/:id', (req, res) => {
    const { id } = req.params;
    const { numero, capacidade, tipo_sala, localizacao } = req.body;
    const query = 'UPDATE sala SET numero = ?, capacidade = ?, tipo_sala = ?, localizacao = ? WHERE id_sala = ?';
    db.query(query, [numero, capacidade, tipo_sala, localizacao, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar sala' });
        res.status(200).json({ message: 'Sala atualizada com sucesso' });
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

    const query = `UPDATE sala SET ${fields.join(', ')} WHERE id_sala = ?`;
    values.push(id);

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar sala' });
        res.status(200).json({ message: 'Sala atualizada com sucesso' });
    });
});

router.delete('/deleteById/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM sala WHERE id_sala = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao deletar sala' });
        res.status(200).json({ message: 'Sala deletada com sucesso' });
    });
});

module.exports = router;
