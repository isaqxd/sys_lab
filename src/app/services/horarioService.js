const horarioDao = require('../daos/horarioDao');

const TURNOS = ['MANHA', 'TARDE', 'NOITE'];

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const toSeconds = h => {
  const [hh, mm, ss = '00'] = h.split(':').map(Number);
  return hh * 3600 + mm * 60 + ss;
};

const normalizeTime = t => {
  if (!t || !timeRegex.test(t)) return null;
  return /^\d{2}:\d{2}$/.test(t) ? t + ':00' : t;
};

function validarHorario(h) {
    if (!h.turno || !h.hora_inicio || !h.hora_fim) return { ok: false, erro: 'turno, hora_inicio e hora_fim obrigatórios' };
    if (!TURNOS.includes(h.turno)) return { ok: false, erro: `Turno inválido: ${h.turno}` };

    const hi = normalizeTime(h.hora_inicio);
    const hf = normalizeTime(h.hora_fim);
    if (!hi || !hf) return { ok: false, erro: 'Formato de hora inválido' };
    if (toSeconds(hi) >= toSeconds(hf)) return { ok: false, erro: 'hora_inicio deve ser menor que hora_fim' };

    return { ok: true, horario: { turno: h.turno, hora_inicio: hi, hora_fim: hf } };
}

// CREATE single ou múltiplo
function salvarHorario(data, callback) {
    if (Array.isArray(data)) {
        if (data.length === 0) return callback({ status: 400, erro: 'Array vazio' });

        const valores = [];
        for (const h of data) {
            const valid = validarHorario(h);
            if (!valid.ok) return callback({ status: 400, erro: valid.erro });
            valores.push(valid.horario);
        }

        return horarioDao.salvarHorariosEmLote(valores, callback);
    }

    const valid = validarHorario(data);
    if (!valid.ok) return callback({ status: 400, erro: valid.erro });

    horarioDao.salvarHorario(valid.horario, callback);
}

// READ
function buscarTodos(callback) { return horarioDao.buscarTodos(callback); }
function buscarPorId(id, callback) { return horarioDao.buscarPorId(id, callback); }

// UPDATE full
function atualizarHorario(id, data, callback) {
    const valid = validarHorario(data);
    if (!valid.ok) return callback({ status: 400, erro: valid.erro });

    horarioDao.atualizarHorario(id, valid.horario, callback);
}

// UPDATE parcial
function atualizarParcial(id, campos, callback) {
    const allowed = ['turno','hora_inicio','hora_fim'];
    const fieldsSQL = [];
    const values = [];

    for (const k of Object.keys(campos)) {
        if (!allowed.includes(k)) return callback({ status: 400, erro: `Campo inválido: ${k}` });
        let val = campos[k];
        if (k === 'turno') {
            if (!TURNOS.includes(val)) return callback({ status: 400, erro: `Turno inválido: ${TURNOS.join(', ')}` });
        } else {
            val = normalizeTime(val);
            if (!val) return callback({ status: 400, erro: `Formato inválido de ${k}` });
        }
        fieldsSQL.push(`${k} = ?`);
        values.push(val);
    }

    if (campos.hora_inicio && campos.hora_fim) {
        if (toSeconds(normalizeTime(campos.hora_inicio)) >= toSeconds(normalizeTime(campos.hora_fim))) {
            return callback({ status: 400, erro: 'hora_inicio deve ser menor que hora_fim' });
        }
    }

    horarioDao.atualizarParcial(id, fieldsSQL.join(', '), values, callback);
}

// DELETE
function deletar(id, callback) { horarioDao.deletarHorario(id, callback); }

module.exports = {
    salvarHorario,
    buscarTodos,
    buscarPorId,
    atualizarHorario,
    atualizarParcial,
    deletar,
    TURNOS
};
