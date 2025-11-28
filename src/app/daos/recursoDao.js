// src/app/daos/recursoDao.js
const db = require('../db');

function salvarRecurso(recurso, callback) {
  const { nome } = recurso;
  const querySave = 'INSERT INTO recurso (nome) VALUES (?)';
  db.query(querySave, [nome], callback);
}

function salvarRecursosEmLote(lista, callback) {
  // lista = [{ nome: 'Projetor' }, { nome: 'Computador' }, ...]
  const values = lista.map(r => [r.nome]);
  const querySave = 'INSERT INTO recurso (nome) VALUES ?';
  db.query(querySave, [values], callback);
}

function buscarTodas(callback) {
  const queryFindAll = 'SELECT * FROM recurso ORDER BY id_recurso DESC';
  db.query(queryFindAll, callback);
}

function buscarPorId(id, callback) {
  const queryFindById = 'SELECT * FROM recurso WHERE id_recurso = ?';
  db.query(queryFindById, [id], callback);
}

function atualizarRecurso(id, recurso, callback) {
  const { nome } = recurso;
  const queryUpdate = 'UPDATE recurso SET nome = ? WHERE id_recurso = ?';
  db.query(queryUpdate, [nome, id], callback);
}

function atualizarParcial(id, campos, callback) {
  const sets = [];
  const values = [];

  if (campos.nome !== undefined) {
    sets.push('nome = ?');
    values.push(campos.nome);
  }

  if (sets.length === 0) {
    // nada pra atualizar
    return callback(null, { affectedRows: 0 });
  }

  const query = `UPDATE recurso SET ${sets.join(', ')} WHERE id_recurso = ?`;
  values.push(id);

  db.query(query, values, callback);
}

function deletarRecurso(id, callback) {
  const queryDelete = 'DELETE FROM recurso WHERE id_recurso = ?';
  db.query(queryDelete, [id], callback);
}

module.exports = {
  salvarRecurso,
  salvarRecursosEmLote,
  buscarTodas,
  buscarPorId,
  atualizarRecurso,
  atualizarParcial,
  deletarRecurso
};
