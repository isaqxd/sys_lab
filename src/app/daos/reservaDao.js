const db = require('../db');

function salvarReserva(reserva, callback) {
    const { fk_usuario, fk_sala, fk_horario, data_reserva, motivo, status } = reserva;

    db.query(
        'INSERT INTO reserva (fk_usuario, fk_sala, fk_horario, data_reserva, motivo, status) VALUES (?, ?, ?, ?, ?, ?)',
        [fk_usuario, fk_sala, fk_horario, data_reserva, motivo || null, status || 'CONFIRMADA'],
        callback
    );
}

function salvarReservasEmLote(lista, callback) {
    db.query(
        'INSERT INTO reserva (fk_usuario, fk_sala, fk_horario, data_reserva, motivo, status) VALUES ?',
        [lista],
        callback
    );
}

function buscarTodas(callback) {
    db.query('SELECT * FROM reserva ORDER BY id_reserva DESC', callback);
}

function buscarPorId(id, callback) {
    db.query('SELECT * FROM reserva WHERE id_reserva = ?', [id], callback);
}

function atualizarReserva(id, reserva, callback) {
    const { fk_usuario, fk_sala, fk_horario, data_reserva, motivo, status } = reserva;

    db.query(
        'UPDATE reserva SET fk_usuario=?, fk_sala=?, fk_horario=?, data_reserva=?, motivo=?, status=? WHERE id_reserva=?',
        [fk_usuario, fk_sala, fk_horario, data_reserva, motivo || null, status, id],
        callback
    );
}

function atualizarParcial(id, camposSQL, valores, callback) {
    db.query(
        `UPDATE reserva SET ${camposSQL} WHERE id_reserva=?`,
        [...valores, id],
        callback
    );
}

function deletarReserva(id, callback) {
    db.query('DELETE FROM reserva WHERE id_reserva = ?', [id], callback);
}

function buscarReserva(id, callback) {
    const consultaProfessor = `
        SELECT 
            r.id_reserva, 
            r.data_reserva, 
            r.status, 
            r.motivo,
            r.fk_horario, -- Adicionado para garantir
            s.nome AS nome_sala,
            h.turno AS nome_turno, -- Traz o nome (MANHÃ, TARDE...)
            h.hora_inicio, 
            h.hora_fim
        FROM reserva r
        JOIN sala s ON s.id_sala = r.fk_sala
        JOIN horario h ON h.id_horario = r.fk_horario -- JOIN adicionado
        WHERE r.fk_usuario = ?
        ORDER BY r.data_reserva DESC;
    `;
    db.query(consultaProfessor, [id], callback);
}

module.exports = {
    salvarReserva,
    salvarReservasEmLote,
    buscarTodas,
    buscarPorId,
    atualizarReserva,
    atualizarParcial,
    deletarReserva,
    buscarReserva
};
