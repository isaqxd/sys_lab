// app/controllers/usuario.js
const express = require('express');
const router = express.Router();
const db = require('../db');

const validateEmail = e => typeof e === 'string' && /\S+@\S+\.\S+/.test(e);
const validateNome = n => typeof n === 'string' && n.trim().length > 0;

const handleDbError = (err, res) => {
  if (!err) return;
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ sucesso: false, erro: 'E-mail já cadastrado' });
  console.error(err);
  return res.status(500).json({ sucesso: false, erro: 'Erro no banco' });
};

// CREATE (single or bulk)
router.post('/save', (req, res) => {
  if (!req.body) return res.status(400).json({ sucesso: false, erro: 'Corpo vazio' });

  if (Array.isArray(req.body)) {
    if (req.body.length === 0) return res.status(400).json({ sucesso: false, erro: 'Lista vazia' });
    const values = [];
    for (const u of req.body) {
      if (!validateNome(u.nome) || !validateEmail(u.email) || !u.senha) return res.status(400).json({ sucesso: false, erro: 'nome,email,senha obrigatórios' });
      values.push([u.nome.trim(), u.email.trim(), u.senha, u.tipo ?? 'PROFESSOR', u.status_usuario ?? true]);
    }
    return db.query('INSERT INTO usuario (nome,email,senha,tipo,status_usuario) VALUES ?', [values], (err, result) => {
      if (err) return handleDbError(err, res);
      return res.status(201).json({ sucesso: true, data: { inserted: result.affectedRows } });
    });
  }

  const { nome, email, senha, tipo, status_usuario } = req.body;
  if (!validateNome(nome) || !validateEmail(email) || !senha) return res.status(400).json({ sucesso: false, erro: 'nome,email,senha obrigatórios' });

  db.query('INSERT INTO usuario (nome,email,senha,tipo,status_usuario) VALUES (?, ?, ?, ?, ?)', [nome.trim(), email.trim(), senha, tipo ?? 'PROFESSOR', status_usuario ?? true], (err, result) => {
    if (err) return handleDbError(err, res);
    return res.status(201).json({ sucesso: true, data: { id_usuario: result.insertId } });
  });
});

// READ ALL
router.get('/findAll', (req, res) => {
  db.query('SELECT id_usuario, nome, email, tipo, status_usuario FROM usuario ORDER BY id_usuario', (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    return res.json({ sucesso: true, data: rows });
  });
});

// READ BY ID
router.get('/findById/:id', (req, res) => {
  db.query('SELECT id_usuario, nome, email, tipo, status_usuario FROM usuario WHERE id_usuario = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar' });
    if (rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    return res.json({ sucesso: true, data: rows[0] });
  });
});

// DELETE (desativar)
router.delete('/deleteById/:id', (req, res) => {
  db.query('UPDATE usuario SET status_usuario = FALSE WHERE id_usuario = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao desativar' });
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

// UPDATE FULL
router.put('/updateById/:id', (req, res) => {
  const { nome, email, senha, tipo, status_usuario } = req.body;
  if (!validateNome(nome) || !validateEmail(email) || !senha || tipo === undefined || status_usuario === undefined) return res.status(400).json({ sucesso: false, erro: 'Todos os campos obrigatórios' });

  db.query('UPDATE usuario SET nome=?, email=?, senha=?, tipo=?, status_usuario=? WHERE id_usuario=?', [nome.trim(), email.trim(), senha, tipo, status_usuario, req.params.id], (err, result) => {
    if (err) return handleDbError(err, res);
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

// UPDATE PARTIAL
router.patch('/updatePartial/:id', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ sucesso: false, erro: 'Nenhum campo enviado' });
  const allowed = ['nome','email','senha','tipo','status_usuario'];
  const fields = [];
  const values = [];
  for (const k of Object.keys(req.body)) {
    if (!allowed.includes(k)) return res.status(400).json({ sucesso: false, erro: `Campo inválido: ${k}` });
    if (k === 'nome' && !validateNome(req.body[k])) return res.status(400).json({ sucesso: false, erro: 'Nome inválido' });
    if (k === 'email' && !validateEmail(req.body[k])) return res.status(400).json({ sucesso: false, erro: 'Email inválido' });
    fields.push(`${k} = ?`);
    values.push(req.body[k]);
  }
  values.push(req.params.id);
  db.query(`UPDATE usuario SET ${fields.join(', ')} WHERE id_usuario = ?`, values, (err, result) => {
    if (err) return handleDbError(err, res);
    if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    return res.json({ sucesso: true, data: { updated: result.affectedRows } });
  });
});

module.exports = router;