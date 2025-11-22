// app/controllers/usuarioController.js
const express = require('express');
const router = express.Router();
const usuarioService = require('../services/usuarioService');

// CREATE (single ou múltiplo)
router.post('/save', (req, res) => {
  usuarioService.salvarUsuario(req.body, (err, result) => {
    if (err) {
      if (err.status) return res.status(err.status).json({ sucesso: false, erro: err.erro });
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
  usuarioService.buscarTodos((err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    }
    res.json({ sucesso: true, data: rows });
  });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
  usuarioService.buscarPorId(req.params.id, (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    }
    if (!row) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    res.json({ sucesso: true, data: row });
  });
});

// DELETE (desativar)
router.delete('/deleteById/:id', (req, res) => {
  usuarioService.desativar(req.params.id, (err, result) => {
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
  usuarioService.atualizarPorId(req.params.id, req.body, (err, result) => {
    if (err) {
      if (err.status) return res.status(err.status).json({ sucesso: false, erro: err.erro });
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
  usuarioService.atualizarParcial(req.params.id, req.body, (err, result) => {
    if (err) {
      if (err.status) return res.status(err.status).json({ sucesso: false, erro: err.erro });
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: 'E-mail já cadastrado' });
      console.error(err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

module.exports = router;