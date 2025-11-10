const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/save', (req, res) => {
    if (Array.isArray(req.body)) {
        const recursos = req.body;
        const values = recursos.map(r => [r.nome_recurso]);
        const query = 'INSERT INTO recurso (nome_recurso) VALUES ?';
        db.query(query, [values], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao cadastrar múltiplos recursos' });
            }
            res.status(201).json({ message: `${result.affectedRows} recursos cadastrados com sucesso` });
        });
        return;
    }

    const { nome_recurso } = req.body;
    const query = 'INSERT INTO recurso (nome_recurso) VALUES (?)';
    db.query(query, [nome_recurso], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao cadastrar recurso' });
        res.status(201).json({ message: 'Recurso cadastrado com sucesso', recursoId: result.insertId });
    });
});

router.get('/findAll', (req, res) => {
    const query = 'SELECT * FROM recurso';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar recursos' });
        res.status(200).json(results);
    });
});

router.get('/findById/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM recurso WHERE id_recurso = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar recurso' });
        if (results.length === 0) return res.status(404).json({ message: 'Recurso não encontrado' });
        res.status(200).json(results[0]);
    });
});

router.put('/updateById/:id', (req, res) => {
    const { id } = req.params;
    const { nome_recurso } = req.body;
    const query = 'UPDATE recurso SET nome_recurso = ? WHERE id_recurso = ?';
    db.query(query, [nome_recurso, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar recurso' });
        res.status(200).json({ message: 'Recurso atualizado com sucesso' });
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
    const query = `UPDATE recurso SET ${fields.join(', ')} WHERE id_recurso = ?`;
    values.push(id);
    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar recurso' });
        res.status(200).json({ message: 'Recurso atualizado com sucesso' });
    });
});

router.delete('/deleteById/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM recurso WHERE id_recurso = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao deletar recurso' });
        res.status(200).json({ message: 'Recurso deletado com sucesso' });
    });
});

module.exports = router;
