const db = require('../db');

function salvarHorario(horario, callback) {
    const { turno, hora_inicio, hora_fim } = horario;
    const query = 'INSERT INTO horario (turno, hora_inicio, hora_fim) VALUES (?, ?, ?)';
    db.query(query, [turno, hora_inicio, hora_fim], callback);
}

function salvarHorariosEmLote(lista, callback) {
    const values = lista.map(h => [h.turno, h.hora_inicio, h.hora_fim]);
    const query = 'INSERT INTO horario (turno, hora_inicio, hora_fim) VALUES ?';
    db.query(query, [values], callback);
}

function buscarTodos(callback) {
    db.query('SELECT * FROM horario ORDER BY id_horario ASC', callback);
}

function buscarPorId(id, callback) {
    db.query('SELECT * FROM horario WHERE id_horario = ?', [id], callback);
}

function atualizarHorario(id, horario, callback) {
    const { turno, hora_inicio, hora_fim } = horario;
    const query = 'UPDATE horario SET turno = ?, hora_inicio = ?, hora_fim = ? WHERE id_horario = ?';
    db.query(query, [turno, hora_inicio, hora_fim, id], callback);
}

function atualizarParcial(id, camposSQL, valores, callback) {
    db.query(`UPDATE horario SET ${camposSQL} WHERE id_horario = ?`, [...valores, id], callback);
}

function deletarHorario(id, callback) {
    db.query('DELETE FROM horario WHERE id_horario = ?', [id], callback);
}

module.exports = {
    salvarHorario,
    salvarHorariosEmLote,
    buscarTodos,
    buscarPorId,
    atualizarHorario,
    atualizarParcial,
    deletarHorario
};
