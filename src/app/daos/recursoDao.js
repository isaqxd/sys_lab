const db = require('../db');

function salvarRecurso(recurso, callback) {
    const { nome } = recurso;
    const querySave = 'INSERT INTO recurso (nome) VALUES (?)';

    db.query(querySave, [nome], callback);
}

function salvarRecursosEmLote(lista, callback) {
    const querySave = 'INSERT INTO recurso (nome) VALUES (?)';
    db.query(querySave, [lista], callback);
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
    const { fk_usuario, fk_sala, fk_horario, data_recurso, motivo, status } = recurso;
    const queryUpdate = 'UPDATE recurso SET fk_usuario=?, fk_sala=?, fk_horario=?, data_recurso=?, motivo=?, status=? WHERE id_recurso=?';
    db.query(
        queryUpdate,
        [fk_usuario, fk_sala, fk_horario, data_recurso, motivo || null, status, id],
        callback
    );
}

function atualizarParcial(id, camposSQL, valores, callback) {
    db.query(
        `UPDATE recurso SET ${camposSQL} WHERE id_recurso=?`,
        [...valores, id],
        callback
    );
}

function deletarRecurso(id, callback) {
    const queryDelete = 'DELETE FROM recurso WHERE id_recurso = ?'
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
