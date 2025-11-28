// app/controllers/authController.js
const express = require('express');
const router = express.Router();
const usuarioDao = require('../daos/usuarioDao'); // Certifique-se de ter criado esse DAO conforme passo anterior

// Rota: /api/auth/login
router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ sucesso: false, erro: 'Email e senha são obrigatórios.' });
    }

    // Chama o DAO para buscar o usuário
    usuarioDao.buscarPorEmail(email, (err, resultados) => {
        if (err) {
            console.error('Erro no banco:', err);
            return res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor.' });
        }

        // 1. Verifica se usuário existe
        if (resultados.length === 0) {
            return res.status(401).json({ sucesso: false, erro: 'Email ou senha incorretos.' });
        }

        const usuario = resultados[0];

        // 2. Verifica senha (comparação simples conforme seu banco atual)
        if (usuario.senha !== senha) {
            return res.status(401).json({ sucesso: false, erro: 'Email ou senha incorretos.' });
        }

        // 3. Sucesso! Retorna dados
        return res.status(200).json({
            sucesso: true,
            data: {
                id: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });
    });
});

module.exports = router;