// app/services/usuarioService.js
const usuarioDAO = require('../daos/usuarioDao');

function validarEmail(email) {
    return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
}

function validarNome(nome) {
    return typeof nome === 'string' && nome.trim().length > 0;
}

function salvarUsuario(data, callback) {
    if (Array.isArray(data)) {
        for (const u of data) {
            if (!validarNome(u.nome) || !validarEmail(u.email) || !u.senha) {
                return callback({ status: 400, erro: 'nome,email,senha obrigatórios' });
            }
        }
        return usuarioDAO.inserirUsuariosEmLote(data, callback);
    }

    if (!validarNome(data.nome) || !validarEmail(data.email) || !data.senha) {
        return callback({ status: 400, erro: 'nome,email,senha obrigatórios' });
    }

    usuarioDAO.inserirUsuario({
        ...data,
        tipo: data.tipo ?? 'PROFESSOR',
        status_usuario: data.status_usuario ?? true
    }, callback);
}

// READ ALL
function buscarTodos(callback) {
    usuarioDAO.buscarTodos(callback);
}

// READ BY ID
function buscarPorId(id, callback) {
    usuarioDAO.buscarPorId(id, callback);
}

// UPDATE FULL
function atualizarPorId(id, usuario, callback) {
    if (!validarNome(usuario.nome) || !validarEmail(usuario.email) || !usuario.senha || usuario.tipo === undefined || usuario.status_usuario === undefined) {
        return callback({ status: 400, erro: 'Todos os campos obrigatórios' });
    }
    usuarioDAO.atualizarPorId(id, usuario, callback);
}

// UPDATE PARCIAL
function atualizarParcial(id, campos, callback) {
    const allowed = ['nome','email','senha','tipo','status_usuario'];
    const fieldsSQL = [];
    const values = [];

    for (const k of Object.keys(campos)) {
        if (!allowed.includes(k)) return callback({ status: 400, erro: `Campo inválido: ${k}` });
        if (k === 'nome' && !validarNome(campos[k])) return callback({ status: 400, erro: 'Nome inválido' });
        if (k === 'email' && !validarEmail(campos[k])) return callback({ status: 400, erro: 'Email inválido' });
        fieldsSQL.push(`${k} = ?`);
        values.push(campos[k]);
    }

    usuarioDAO.atualizarParcial(id, fieldsSQL.join(', '), values, callback);
}

// DELETE (desativar)
function desativar(id, callback) {
    usuarioDAO.desativar(id, callback);
}

module.exports = {
    salvarUsuario,
    validarNome,
    validarEmail,
    buscarTodos,
    buscarPorId,
    atualizarPorId,
    atualizarParcial,
    desativar,
    dao: usuarioDAO
};
