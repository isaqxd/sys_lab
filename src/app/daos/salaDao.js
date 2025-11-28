const db = require('../db');

function salvarSala(sala, callback) {
    const { nome, capacidade, status } = sala;
    const querySave = 'INSERT INTO sala (nome, capacidade, status) VALUES (?, ?, ?)';

    db.query(
        querySave,
        [nome, capacidade, status || 'DISPONIVEL'],
        callback
    );
}

function salvarSalasEmLote(lista, callback) {
    const querySave = 'INSERT INTO sala (nome, capacidade, status) VALUES ?';

    db.query(querySave, [lista], callback);
}

function buscarTodos(callback) {
    const queryFindAll = 'SELECT * FROM sala ORDER BY id_sala ASC';
    db.query(queryFindAll, callback);
}

function buscarPorId(id, callback) {
    const queryFindById = 'SELECT * FROM sala WHERE id_sala = ?';
    db.query(queryFindById, [id], callback);
}

function atualizarSala(id, sala, callback) {
    const { nome, capacidade, status } = sala;
    const queryUpdate = 'UPDATE sala SET nome = ?, capacidade = ?, status = ? WHERE id_sala = ?';
    db.query(
        queryUpdate,
        [nome, capacidade, status, id],
        callback
    );
}

function atualizarParcial(id, camposSQL, valores, callback) {
    db.query(
        `UPDATE sala SET ${camposSQL} WHERE id_sala = ?`,
        [...valores, id],
        callback
    );
}

function deleteSala(id, callback) {
    const queryDelete = 'DELETE FROM sala WHERE id_sala = ?';
    db.query(queryDelete, [id], callback);
}

module.exports = {
    salvarSala,
    salvarSalasEmLote,
    buscarTodos,
    buscarPorId,
    atualizarSala,
    atualizarParcial,
    deleteSala
}
