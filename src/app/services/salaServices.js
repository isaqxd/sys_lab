// app/services/salaService.js
const salaDao = require('../daos/salaDao');
const salaRecursoDao = require('../daos/salaRecursoDao');
const recursoService = require('./recursoService');

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

    // Extrai recursos do payload
    const recursos = data.recursos || [];
    delete data.recursos;

    // Salva a sala primeiro
    salaDao.salvarSala({
        ...data,
        status: data.status ?? 'DISPONIVEL'
    }, (err, result) => {
        if (err) return callback(err);
        
        const idSala = result.insertId;
        
        if (recursos.length > 0) {
            vincularRecursosSala(idSala, recursos, (errVinculo) => {
                if (errVinculo) {
                    console.error('Erro ao vincular recursos:', errVinculo);
                }
                callback(null, { ...result, recursosVinculados: recursos.length });
            });
        } else {
            callback(null, result);
        }
    });
}

function vincularRecursosSala(idSala, recursosIds, callback) {
    if (!recursosIds || recursosIds.length === 0) {
        return callback(null, { affectedRows: 0 });
    }
    
    let vinculosCriados = 0;
    let errors = [];
    
    recursosIds.forEach((idRecurso) => {
        salaRecursoDao.vincular(idSala, idRecurso, (err, result) => {
            if (err) {
                errors.push(`Recurso ${idRecurso}: ${err.message}`);
            } else {
                vinculosCriados++;
            }
            
            // Quando todos os vínculos foram processados
            if (vinculosCriados + errors.length === recursosIds.length) {
                if (errors.length > 0) {
                    callback({ 
                        message: `Alguns vínculos falharam: ${errors.join(', ')}`,
                        vinculosCriados,
                        erros: errors 
                    });
                } else {
                    callback(null, { vinculosCriados });
                }
            }
        });
    });
}

function buscarTodos(callback) {
    salaDao.buscarTodos((err, salas) => {
        if (err) return callback(err);
        
        // Para cada sala, busca seus recursos
        const salasCompleta = [];
        let processadas = 0;
        
        if (salas.length === 0) {
            return callback(null, []);
        }
        
        salas.forEach((sala, index) => {
            salaRecursoDao.buscarPorSala(sala.id_sala, (errRecursos, recursos) => {
                if (!errRecursos) {
                    sala.recursos = recursos;
                } else {
                    sala.recursos = [];
                }
                
                salasCompleta[index] = sala;
                processadas++;
                
                if (processadas === salas.length) {
                    callback(null, salasCompleta);
                }
            });
        });
    });
}

// READ BY ID com recursos
function buscarPorId(id, callback) {
    salaDao.buscarPorId(id, (err, rows) => {
        if (err) return callback(err);
        if (!rows || rows.length === 0) return callback(null, null);
        
        const sala = rows[0];
        
        salaRecursoDao.buscarPorSala(id, (errRecursos, recursos) => {
            if (!errRecursos) {
                sala.recursos = recursos;
            } else {
                sala.recursos = [];
            }
            callback(null, sala);
        });
    });
}

// UPDATE com recursos
function atualizarSala(id, sala, callback) {
    const v = validateSalaPayload(sala);
    if (!v.ok) return callback({ status: 400, erro: v.erro });

    const recursos = sala.recursos || [];
    delete sala.recursos;

    salaDao.atualizarSala(id, sala, (err, result) => {
        if (err) return callback(err);
        
        salaRecursoDao.removerTodosPorSala(id, (errRemove) => {
            if (errRemove) {
                console.error('Erro ao remover vínculos antigos:', errRemove);
            }
            
            if (recursos.length > 0) {
                vincularRecursosSala(id, recursos, (errVinculo) => {
                    if (errVinculo) {
                        console.error('Erro ao vincular recursos:', errVinculo);
                    }
                    callback(null, { 
                        ...result, 
                        recursosAtualizados: recursos.length 
                    });
                });
            } else {
                callback(null, result);
            }
        });
    });
}
function buscarRecursosDisponiveis(callback) {
    recursoService.buscarTodos(callback);
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
    validateSalaPayload,
    buscarRecursosDisponiveis
};