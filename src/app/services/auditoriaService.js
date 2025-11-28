const auditoriaDao = require('../daos/auditoriaDao');

// Função simples para validar o payload de auditoria
function validarAuditoria(auditoria) {
    if (!auditoria) return { ok: false, erro: 'Dados ausentes' };
    // acao e descricao podem ser opcionais, fk_usuario também
    return { ok: true };
}

// Salvar single ou múltiplos registros
function salvarAuditoria(data, callback) {
    if (Array.isArray(data)) {
        if (data.length === 0) return callback({ status: 400, erro: 'Lista vazia' });

        const valores = [];
        for (const a of data) {
            const v = validarAuditoria(a);
            if (!v.ok) return callback({ status: 400, erro: v.erro });
            valores.push([a.fk_usuario || null, a.acao || null, a.descricao || null]);
        }

        return auditoriaDao.salvarAuditoriasEmLote(valores, callback);
    }

    const valid = validarAuditoria(data);
    if (!valid.ok) return callback({ status: 400, erro: valid.erro });

    auditoriaDao.salvarAuditoria({
        fk_usuario: data.fk_usuario || null,
        acao: data.acao || null,
        descricao: data.descricao || null
    }, callback);
}

// READ ALL
function buscarTodas(callback) {
    auditoriaDao.buscarTodas(callback);
}

// READ BY ID
function buscarPorId(id, callback) {
    auditoriaDao.buscarPorId(id, callback);
}

// DELETE
function deletar(id, callback) {
    auditoriaDao.deletarAuditoria(id, callback);
}

module.exports = {
    salvarAuditoria,
    buscarTodas,
    buscarPorId,
    deletar,
    dao: auditoriaDao
};
