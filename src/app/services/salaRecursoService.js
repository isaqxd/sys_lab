const salaRecursoDao = require('../daos/salaRecursoDao');

function vincular(fk_sala, fk_recurso, callback) {
    if (!fk_sala || !fk_recurso) return callback({ status: 400, erro: 'fk_sala e fk_recurso obrigatórios' });

    salaRecursoDao.vincular(fk_sala, fk_recurso, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return callback({ status: 409, erro: 'Vínculo já existe' });
            return callback({ status: 500, erro: 'Erro ao vincular' });
        }
        callback(null, result);
    });
}

function buscarPorSala(fk_sala, callback) {
    salaRecursoDao.buscarPorSala(fk_sala, (err, rows) => {
        if (err) return callback({ status: 500, erro: 'Erro ao buscar' });
        callback(null, rows);
    });
}

function removerVinculo(fk_sala, fk_recurso, callback) {
    if (!fk_sala || !fk_recurso) return callback({ status: 400, erro: 'fk_sala e fk_recurso obrigatórios' });

    salaRecursoDao.removerVinculo(fk_sala, fk_recurso, (err, result) => {
        if (err) return callback({ status: 500, erro: 'Erro ao remover' });
        if (result.affectedRows === 0) return callback({ status: 404, erro: 'Vínculo não encontrado' });
        callback(null, result);
    });
}

function removerTodosPorSala(fk_sala, callback) {
    salaRecursoDao.removerTodosPorSala(fk_sala, (err, result) => {
        if (err) return callback({ status: 500, erro: 'Erro ao remover' });
        if (result.affectedRows === 0) return callback({ status: 404, erro: 'Nenhum vínculo encontrado' });
        callback(null, result);
    });
}

module.exports = {
    vincular,
    buscarPorSala,
    removerVinculo,
    removerTodosPorSala
};
