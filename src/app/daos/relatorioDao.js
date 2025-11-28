const db = require('../db');

function buscarParaRelatorio(filtros, callback) {
    let sql = `
        SELECT 
            r.id_reserva,
            r.data_reserva,
            r.status,
            r.motivo,
            u.nome as nome_usuario,
            s.nome as nome_sala,
            h.turno,
            h.hora_inicio,
            h.hora_fim
        FROM reserva r
        JOIN usuario u ON r.fk_usuario = u.id_usuario
        JOIN sala s ON r.fk_sala = s.id_sala
        JOIN horario h ON r.fk_horario = h.id_horario
        WHERE 1=1
    `;

    const values = [];

    if (filtros.dataInicio) {
        sql += ' AND r.data_reserva >= ?';
        values.push(filtros.dataInicio);
    }

    if (filtros.dataFim) {
        sql += ' AND r.data_reserva <= ?';
        values.push(filtros.dataFim);
    }

    if (filtros.idSala && filtros.idSala !== '0') {
        sql += ' AND r.fk_sala = ?';
        values.push(filtros.idSala);
    }

    if (filtros.nomeUsuario) {
        sql += ' AND u.nome LIKE ?';
        values.push(`%${filtros.nomeUsuario}%`);
    }

    sql += ' ORDER BY r.data_reserva DESC, h.hora_inicio ASC';

    db.query(sql, values, callback);
}

module.exports = {
    buscarParaRelatorio
};