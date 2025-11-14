const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/save', (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Corpo da requisição vazio' });
    }

    if (Array.isArray(req.body)) {
        const usuarios = req.body;
        const values = usuarios.map(u => [u.nome, u.email, u.senha]);
        const query = 'INSERT INTO USUARIO (nome, email, senha) VALUES ?';

        return db.query(query, [values], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao cadastrar múltiplos usuários' });
            }
            return res.status(201).json({
                message: `${result.affectedRows} usuários cadastrados com sucesso`
            });
        });
    }

    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha)
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });

    const query = 'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)';
    db.query(query, [nome, email, senha], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
        res.status(201).json({ message: 'Usuário cadastrado com sucesso', userId: result.insertId });
    });
});

router.get('/findAll', (req, res) => {
    db.query('SELECT * FROM usuario', (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar usuários' });
        res.status(200).json(results);
    });
})

router.get('/findById/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM usuario WHERE id_usuario = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar usuário' });
        if (results.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.status(200).json(results[0]);
    });
});

router.delete('/deleteById/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM usuario WHERE id_usuario = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao deletar usuário' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.status(204).send();
    });
});

router.put('/updateById/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha)
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });

    const query = 'UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id_usuario = ?';
    db.query(query, [nome, email, senha, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    });
});

router.patch('/updatePartial/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0)
        return res.status(400).json({ error: 'Nenhum campo fornecido para atualização' });

    const fields = Object.keys(updates).map(key => `${key} = ?`);
    const values = Object.values(updates);
    const query = `UPDATE usuario SET ${fields.join(', ')} WHERE id_usuario = ?`;

    values.push(id);
    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    });
});

module.exports = router;