const reservaDao = require('../daos/reservaDao');

function validarPayload(r, requireAll = true) {
  const { fk_usuario, fk_sala, fk_horario, data_reserva } = r;

  if (requireAll) {
    if (!fk_usuario || !fk_sala || !fk_horario || !data_reserva) {
      return { ok: false, erro: 'fk_usuario, fk_sala, fk_horario e data_reserva obrigatórios' };
    }
  }

  if (data_reserva && !/^\d{4}-\d{2}-\d{2}$/.test(data_reserva)) {
    return { ok: false, erro: 'data_reserva deve ser YYYY-MM-DD' };
  }

  return { ok: true };
}

function salvar(reserva, callback) {
  const v = validarPayload(reserva, true);
  if (!v.ok) return callback({ tipo: 'VALIDACAO', mensagem: v.erro });

  reservaDao.salvarReserva(reserva, callback);
}

function salvarLote(lista, callback) {
  if (!Array.isArray(lista) || lista.length === 0)
    return callback({ tipo: 'VALIDACAO', mensagem: 'Lista vazia' });

  const values = [];

  for (const r of lista) {
    const v = validarPayload(r, true);
    if (!v.ok) return callback({ tipo: 'VALIDACAO', mensagem: v.erro });

    values.push([
      r.fk_usuario,
      r.fk_sala,
      r.fk_horario,
      r.data_reserva,
      r.motivo || null,
      r.status || 'CONFIRMADA'
    ]);
  }

  reservaDao.salvarReservasEmLote(values, callback);
}

function buscarTodas(callback) {
  reservaDao.buscarTodas(callback);
}

function atualizarParcial(id, campos, callback) {
  const allowed = ['fk_usuario', 'fk_sala', 'fk_horario', 'data_reserva', 'motivo', 'data_criacao', 'status'];
  const fieldsSQL = [];
  const values = [];

  for (const k of Object.keys(campos)) {
    if (!allowed.includes(k)) return callback({ status: 400, erro: `Campo inválido: ${k}` });
    fieldsSQL.push(`${k} = ?`);
    values.push(campos[k]);
  }

  reservaDao.atualizarParcial(id, fieldsSQL.join(', '), values, callback);
}

function buscarPorProfessor(professorId, callback) {
  reservaDao.buscarReserva(professorId, (err, rows) => {
    if (err) return callback(err);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const atuais = [];
    const passadas = [];
    const canceladas = [];

    rows.forEach(r => {
      const dataReserva = new Date(r.data_reserva);
      dataReserva.setHours(0, 0, 0, 0);

      if (r.status === 'CANCELADA') {
        canceladas.push(r);
      } else if (new Date(r.data_reserva) < hoje) {
        passadas.push(r);
      } else {
        atuais.push(r);
      }
    });

    callback(null, { atuais, passadas, canceladas });
  });
}

module.exports = {
  salvar,
  salvarLote,
  buscarTodas,
  atualizarParcial,
  buscarPorProfessor
};