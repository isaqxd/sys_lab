const usuarioDAO = require('../dao/usuarioDAO');

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

module.exports = {
    salvarUsuario,
    validarNome,
    validarEmail,
    dao: usuarioDAO
};