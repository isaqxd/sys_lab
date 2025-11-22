const db = require('../db');

// Salvar um único registro de auditoria
function salvarAuditoria(auditoria, callback) {
    const { fk_usuario, acao, descricao } = auditoria;
    const query = 'INSERT INTO auditoria (fk_usuario, acao, descricao) VALUES (?, ?, ?)';
    db.query(query, [fk_usuario, acao, descricao], callback);
}

// Salvar vários registros de auditoria de uma vez
function salvarAuditoriasEmLote(lista, callback) {
    // lista deve ser array de arrays: [[fk_usuario, acao, descricao], ...]
    const query = 'INSERT INTO auditoria (fk_usuario, acao, descricao) VALUES ?';
    db.query(query, [lista], callback);
}

// Buscar todos os registros
function buscarTodas(callback) {
    const query = 'SELECT * FROM auditoria ORDER BY id_log DESC';
    db.query(query, callback);
}

// Buscar por ID
function buscarPorId(id, callback) {
    const query = 'SELECT * FROM auditoria WHERE id_log = ?';
    db.query(query, [id], callback);
}

// Atualizar auditoria completo
function atualizarAuditoria(id, auditoria, callback) {
    const { fk_usuario, acao, descricao } = auditoria;
    const query = 'UPDATE auditoria SET fk_usuario=?, acao=?, descricao=? WHERE id_log=?';
    db.query(query, [fk_usuario, acao, descricao, id], callback);
}

// Atualização parcial
function atualizarParcial(id, camposSQL, valores, callback) {
    const query = `UPDATE auditoria SET ${camposSQL} WHERE id_log=?`;
    db.query(query, [...valores, id], callback);
}

// Deletar registro
function deletarAuditoria(id, callback) {
    const query = 'DELETE FROM auditoria WHERE id_log=?';
    db.query(query, [id], callback);
}

module.exports = {
    salvarAuditoria,
    salvarAuditoriasEmLote,
    buscarTodas,
    buscarPorId,
    atualizarAuditoria,
    atualizarParcial,
    deletarAuditoria
};
