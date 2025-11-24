// src/app/services/recursoService.js
const recursoDao = require('../daos/recursoDao');

function validarNome(nome) {
  return typeof nome === 'string' && nome.trim().length > 0;
}

// CREATE (single ou múltiplo)
function salvarRecurso(data, callback) {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return callback({ status: 400, erro: 'Lista vazia' });
    }
    for (const r of data) {
      if (!validarNome(r.nome)) {
        return callback({ status: 400, erro: 'Nome inválido em um dos itens' });
      }
    }
    return recursoDao.salvarRecursosEmLote(data, callback);
  }

  if (!validarNome(data.nome)) {
    return callback({ status: 400, erro: 'Nome inválido' });
  }

  recursoDao.salvarRecurso(data, callback);
}

// READ ALL
function buscarTodos(callback) {
  recursoDao.buscarTodas((err, rows) => {
    if (err) return callback({ status: 500, erro: 'Erro ao buscar recursos' });
    callback(null, rows);
  });
}

// READ BY ID
function buscarPorId(id, callback) {
  recursoDao.buscarPorId(id, (err, rows) => {
    if (err) return callback({ status: 500, erro: 'Erro ao buscar recurso' });
    if (!rows || rows.length === 0) {
      return callback({ status: 404, erro: 'Recurso não encontrado' });
    }
    callback(null, rows[0]);
  });
}

// UPDATE (PUT)
function atualizarPorId(id, data, callback) {
  if (!validarNome(data.nome)) {
    return callback({ status: 400, erro: 'Nome inválido' });
  }

  recursoDao.atualizarRecurso(id, data, (err, result) => {
    if (err) return callback({ status: 500, erro: 'Erro ao atualizar recurso' });
    if (result.affectedRows === 0) {
      return callback({ status: 404, erro: 'Recurso não encontrado' });
    }
    callback(null, result);
  });
}

// UPDATE PARCIAL (PATCH)
function atualizarParcial(id, data, callback) {
  const campos = {};
  if (data.nome !== undefined) {
    if (!validarNome(data.nome)) {
      return callback({ status: 400, erro: 'Nome inválido' });
    }
    campos.nome = data.nome;
  }

  if (Object.keys(campos).length === 0) {
    return callback({ status: 400, erro: 'Nenhum campo válido para atualizar' });
  }

  recursoDao.atualizarParcial(id, campos, (err, result) => {
    if (err) return callback({ status: 500, erro: 'Erro ao atualizar recurso' });
    if (result.affectedRows === 0) {
      return callback({ status: 404, erro: 'Recurso não encontrado' });
    }
    callback(null, result);
  });
}

// DELETE
function deletar(id, callback) {
  recursoDao.deletarRecurso(id, (err, result) => {
    if (err) return callback({ status: 500, erro: 'Erro ao deletar recurso' });
    callback(null, result);
  });
}

module.exports = {
  salvarRecurso,
  buscarTodos,
  buscarPorId,
  atualizarPorId,
  atualizarParcial,
  deletar
};
