const recursoDao = require('../daos/recursoDao');

function validarNome(nome) {
    return typeof nome === 'string' && nome.trim().length > 0;
}

// CREATE (single ou múltiplo)
function salvarRecurso(data, callback) {
    if (Array.isArray(data)) {
        if (data.length === 0) return callback({ status: 400, erro: 'Lista vazia' });
        for (const r of data) {
            if (!validarNome(r.nome)) return callback({ status: 400, erro: 'Nome inválido em um dos itens' });
        }
        return recursoDao.salvarRecursosEmLote(data, callback);
    }

    if (!validarNome(data.nome)) return callback({ status: 400, erro: 'Nome obrigatório' });
    return recursoDao.salvarRecurso({ ...data }, callback);
}

// READ ALL
function buscarTodos(callback) {
    recursoDao.buscarTodas(callback);
}

// READ BY ID
function buscarPorId(id, callback) {
    recursoDao.buscarPorId(id, callback);
}

// UPDATE FULL
function atualizarPorId(id, recurso, callback) {
    if (!validarNome(recurso.nome)) return callback({ status: 400, erro: 'Nome obrigatório' });
    recursoDao.atualizarRecurso(id, recurso, callback);
}

// UPDATE PARCIAL
function atualizarParcial(id, campos, callback) {
    if (!campos || Object.keys(campos).length === 0) return callback({ status: 400, erro: 'Nenhum campo enviado' });
    if (Object.keys(campos).length > 1) return callback({ status: 400, erro: 'Apenas o campo "nome" é atualizável' });
    if (!validarNome(campos.nome)) return callback({ status: 400, erro: 'Nome inválido' });

    const fieldsSQL = Object.keys(campos).map(k => `${k} = ?`).join(', ');
    const values = Object.values(campos);

    recursoDao.atualizarParcial(id, fieldsSQL, values, callback);
}

// DELETE
function deletar(id, callback) {
    recursoDao.deletarRecurso(id, callback);
}

module.exports = {
    salvarRecurso,
    buscarTodos,
    buscarPorId,
    atualizarPorId,
    atualizarParcial,
    deletar
};