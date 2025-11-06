const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/save', (req, res) => {
    if (Array.isArray(req.body)) {
        const usuarios = req.body;
        const values = usuarios.map(u => [u.nome, u.email, u.senha]);
        const query = 'INSERT INTO usuario (nome, email, senha) VALUES ?';

        db.query(query, [values], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao cadastrar múltiplos usuários' });
            }
            res.status(201).json({
                message: `${result.affectedRows} usuários cadastrados com sucesso`
            });
        });
    }

    const { nome, email, senha } = req.body;
    const query = 'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)';

    db.query(query, [nome, email, senha], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
        res.status(201).json({ message: 'Usuário cadastrado com sucesso', userId: result.insertId });
    });
});

router.get('/findAll', (req, res) => {
    const query = 'SELECT * FROM usuario';

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar usuários' });
        res.status(200).json(results);
    })
})

router.get('/findById/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM usuario WHERE id_usuario = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar usuário' });
        if (results.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.status(200).json(results[0]);
    })
});

router.delete('/deleteById/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM usuario WHERE id_usuario = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao deletar usuário' });
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    })
})

router.put('/updateById/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, senha } = req.body;
    const query = 'UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id_usuario = ?';
    db.query(query, [nome, email, senha, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    })
});

router.patch('/updatePartial/:id', (req, res) => {
    const { id } = req.params;
    const fields = [];
    const values = [];
    for (const key in req.body) {
        fields.push(`${key} = ?`);
        values.push(req.body[key]);
    }

    const query = `UPDATE usuario SET ${fields.join(', ')} WHERE id_usuario = ?`;
    values.push(id);
    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    })
});


module.exports = router;