// app/controllers/usuario.js
const express = require('express');
const router = express.Router();
const usuarioService = require('../services/usuarioService');
const usuarioDAO = usuarioService.dao;

// Funções de validação simples
const validarNome = n => typeof n === 'string' && n.trim().length > 0;
const validarEmail = e => typeof e === 'string' && /\S+@\S+\.\S+/.test(e);

// CREATE (single ou múltiplo)
router.post('/save', (req, res) => {
  usuarioService.salvarUsuario(req.body, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: 'E-mail já cadastrado' });
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro no banco' });
    }

    const response = Array.isArray(req.body)
      ? { inserted: result.affectedRows }
      : { id_usuario: result.insertId };

    res.status(201).json({ sucesso: true, data: response });
  });
});

// READ ALL
router.get('/findAll', (req, res) => {
  usuarioDAO.buscarTodos((err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    }
    res.json({ sucesso: true, data: rows });
  });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
  usuarioDAO.buscarPorId(req.params.id, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    }
    if (rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    res.json({ sucesso: true, data: rows[0] });
  });
});

// DELETE (desativar)
router.delete('/deleteById/:id', (req, res) => {
  usuarioDAO.desativar(req.params.id, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao desativar' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

// UPDATE FULL
router.put('/updateById/:id', (req, res) => {
  const { nome, email, senha, tipo, status_usuario } = req.body;

  if (!validarNome(nome) || !validarEmail(email) || !senha || tipo === undefined || status_usuario === undefined) {
    return res.status(400).json({ sucesso: false, erro: 'Todos os campos obrigatórios' });
  }

  usuarioDAO.atualizarPorId(req.params.id, req.body, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: 'E-mail já cadastrado' });
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro no banco' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

// UPDATE PARCIAL
router.patch('/updatePartial/:id', (req, res) => {
  usuarioDAO.atualizarParcial(req.params.id, req.body, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: 'E-mail já cadastrado' });
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

module.exports = router;