const db = require('../db');

function salvarUsuario(usuario, callback) {
    const { nome, email, senha, tipo, status_usuario } = usuario;
    const querySave = 'INSERT INTO usuario (nome,email,senha,tipo,status_usuario) VALUES (?, ?, ?, ?, ?)';

    db.query(
        querySave,
        [nome, email, senha, tipo, status_usuario || 'PROFESSOR'],
        callback
    );
}

function salvarReservasEmLote(lista, callback) {
    const querySave = 'INSERT INTO usuario (nome,email,senha,tipo,status_usuario) VALUES ?';
    db.query(
        querySave,
        [lista],
        callback
    );
}

function buscarTodos(callback) {
    const queryFindAll = 'SELECT * FROM usuario ORDER BY id_usuario ASC';
    db.query(queryFindAll, callback)
}

function buscarPorId(id, callback) {
    const queryFindById = 'SELECT * FROM usuario WHERE id_usuario = ?';
    db.query(queryFindById, [id], callback);
}

function atualizarUsuario(id, usuario, callback) {
    const { nome, email, senha, tipo, status_usuario } = usuario
    const queryUpdate = 'UPDATE usuario SET nome=?, email=?, senha=?, tipo=?, status_usuario=? WHERE id_usuario = ?';

    db.query(
        queryUpdate,
        [nome, email, senha, tipo, status_usuario, id],
        callback
    );
}

function atualizarParcial(id, camposSQL, valores, callback) {
    db.query(
        `UPDATE usuario SET ${camposSQL} WHERE id_usuario=?`,
        [...valores, id],
        callback
    );
}

function desativarSala(id, callback) {
    const queryDesativar = 'UPDATE usuario SET status_usuario = FALSE WHERE id_usuario = ?';
    db.query(
        queryDesativar,
        [id],
        callback
    );
}

module.exports = {
    salvarUsuario,
    salvarReservasEmLote,
    buscarTodos,
    buscarPorId,
    atualizarUsuario,
    atualizarParcial,
    desativarSala
};