// app/services/salaService.js
const salaDao = require('../daos/salaDao');

const VALID_STATUS = ['DISPONIVEL', 'MANUTENCAO', 'OCUPADA', 'DESATIVADA'];

// Validação básica do payload
function validateSalaPayload(payload, requireAll = true) {
    const { nome, capacidade, status } = payload;
    if (requireAll && (!nome || capacidade === undefined)) {
        return { ok: false, erro: 'nome e capacidade obrigatórios' };
    }
    if (status && !VALID_STATUS.includes(status)) {
        return { ok: false, erro: `status inválido: ${VALID_STATUS.join(', ')}` };
    }
    if (capacidade !== undefined && (!Number.isInteger(capacidade) || capacidade < 0)) {
        return { ok: false, erro: 'capacidade deve ser inteiro >= 0' };
    }
    return { ok: true };
}

// CREATE
function salvarSala(data, callback) {
    if (Array.isArray(data)) {
        const values = [];
        for (const s of data) {
            const v = validateSalaPayload(s);
            if (!v.ok) return callback({ status: 400, erro: v.erro });
            values.push([s.nome, s.capacidade, s.status ?? 'DISPONIVEL']);
        }
        return salaDao.salvarSalasEmLote(values, callback);
    }

    const v = validateSalaPayload(data);
    if (!v.ok) return callback({ status: 400, erro: v.erro });

    salaDao.salvarSala({
        ...data,
        status: data.status ?? 'DISPONIVEL'
    }, callback);
}

// READ ALL
function buscarTodos(callback) {
    salaDao.buscarTodos(callback);
}

// READ BY ID
function buscarPorId(id, callback) {
    salaDao.buscarPorId(id, callback);
}

// UPDATE FULL
function atualizarSala(id, sala, callback) {
    const v = validateSalaPayload(sala);
    if (!v.ok) return callback({ status: 400, erro: v.erro });

    salaDao.atualizarSala(id, sala, callback);
}

// UPDATE PARCIAL
function atualizarParcial(id, campos, callback) {
    const allowed = ['nome','capacidade','status'];
    const fieldsSQL = [];
    const values = [];

    for (const k of Object.keys(campos)) {
        if (!allowed.includes(k)) return callback({ status: 400, erro: `Campo inválido: ${k}` });

        if (k === 'status' && !VALID_STATUS.includes(campos[k])) {
            return callback({ status: 400, erro: `status inválido: ${VALID_STATUS.join(', ')}` });
        }

        if (k === 'capacidade' && (!Number.isInteger(campos[k]) || campos[k] < 0)) {
            return callback({ status: 400, erro: 'capacidade deve ser inteiro >= 0' });
        }

        fieldsSQL.push(`${k} = ?`);
        values.push(campos[k]);
    }

    salaDao.atualizarParcial(id, fieldsSQL.join(', '), values, callback);
}

// DELETE
function deleteSala(id, callback) {
    salaDao.deleteSala(id, callback);
}

module.exports = {
    salvarSala,
    buscarTodos,
    buscarPorId,
    atualizarSala,
    atualizarParcial,
    deleteSala,
    validateSalaPayload
};
