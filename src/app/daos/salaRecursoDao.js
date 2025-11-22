const db = require('../db');

function vincular(fk_sala, fk_recurso, callback) {
    const query = 'INSERT INTO sala_recurso (fk_sala, fk_recurso) VALUES (?, ?)';
    db.query(query, [fk_sala, fk_recurso], callback);
}

function buscarPorSala(fk_sala, callback) {
    const query = `
        SELECT r.id_recurso, r.nome
        FROM sala_recurso sr
        JOIN recurso r ON r.id_recurso = sr.fk_recurso
        WHERE sr.fk_sala = ?`;
    db.query(query, [fk_sala], callback);
}

function removerVinculo(fk_sala, fk_recurso, callback) {
    const query = 'DELETE FROM sala_recurso WHERE fk_sala = ? AND fk_recurso = ?';
    db.query(query, [fk_sala, fk_recurso], callback);
}

function removerTodosPorSala(fk_sala, callback) {
    const query = 'DELETE FROM sala_recurso WHERE fk_sala = ?';
    db.query(query, [fk_sala], callback);
}

module.exports = {
    vincular,
    buscarPorSala,
    removerVinculo,
    removerTodosPorSala
};
