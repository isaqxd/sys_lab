const API_BASE = 'http://localhost:3000/api';

let todosUsuarios = [];

document.addEventListener('DOMContentLoaded', carregarTodosUsuarios);

function toggleLoading(show) {
    const loading = document.getElementById('loading-users');
    const container = document.getElementById('users-container');
    loading.style.display = show ? 'block' : 'none';
    container.style.display = show ? 'none' : 'block';
}

function statusToText(status) {
    return status ? 'Ativo' : 'Inativo';
}

function statusToColor(status) {
    return status ? 'color: green;' : 'color: red;';
}

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="${type}">${message}</div>`;
    setTimeout(() => { messageDiv.innerHTML = ''; }, 5000);
}

async function fetchJSON(url, options = {}) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok || !result.sucesso) throw new Error(result.erro || result.message);
    return result.data;
}

async function carregarTodosUsuarios() {
    toggleLoading(true);
    try {
        todosUsuarios = await fetchJSON(`${API_BASE}/usuario/findAll`);
        exibirUsuarios(todosUsuarios, 'Todos os Usuários');
    } catch (e) {
        console.error(e);
        showMessage('Erro ao carregar usuários', 'error');
        exibirUsuarios([]);
    } finally {
        toggleLoading(false);
    }
}

function carregarUsuariosAtivos() {
    if (!todosUsuarios.length) return showMessage('Carregue os usuários primeiro', 'error');
    exibirUsuarios(todosUsuarios.filter(u => u.status_usuario), 'Usuários Ativos');
}

function carregarUsuariosInativos() {
    if (!todosUsuarios.length) return showMessage('Carregue os usuários primeiro', 'error');
    exibirUsuarios(todosUsuarios.filter(u => !u.status_usuario), 'Usuários Inativos');
}

async function pesquisarPorEmail() {
    const email = document.getElementById('search-email').value.trim();
    if (!email) return showMessage('Digite um email para pesquisar', 'error');

    toggleLoading(true);

    try {
        const usuario = await fetchJSON(`${API_BASE}/usuario/findByEmail?email=${encodeURIComponent(email)}`);
        exibirUsuarios(usuario ? [usuario] : [], `Resultado para: ${email}`);
    } catch (e) {
        showMessage('Nenhum resultado encontrado', 'error');
        exibirUsuarios([], `Nenhum resultado para: ${email}`);
    } finally {
        toggleLoading(false);
    }
}

function limparPesquisa() {
    document.getElementById('search-email').value = '';
    carregarTodosUsuarios();
}

function exibirUsuarios(usuarios, titulo = 'Usuários') {
    const container = document.getElementById('users-container');
    document.querySelector('h2').textContent = titulo;

    if (!usuarios.length) {
        container.innerHTML = '<p>Nenhum usuário encontrado</p>';
        return;
    }

    container.innerHTML = usuarios.map(usuario => criarCardUsuario(usuario)).join('');
}

function criarCardUsuario(usuario) {
    const { id_usuario, nome, email, tipo, status_usuario } = usuario;
    const status = statusToText(status_usuario);

    return `
        <div id="user-${id_usuario}" class="user-card">
            <div class="user-view">
                <div><strong>Nome:</strong> <span id="nome-${id_usuario}">${nome}</span></div>
                <div><strong>Email:</strong> <span id="email-${id_usuario}">${email}</span></div>
                <div><strong>Tipo:</strong> <span id="tipo-${id_usuario}">${tipo}</span></div>
                <div><strong>Status:</strong> <span style="${statusToColor(status_usuario)}">${status}</span></div>
            </div>
            <div class="actions">
                <button onclick="iniciarEdicao(${id_usuario})">Editar</button>
                <button onclick="alterarStatus(${id_usuario})">
                    ${status_usuario ? 'Desativar' : 'Reativar'}
                </button>
            </div>
        </div>
    `;
}

function iniciarEdicao(id) {
    const usuario = todosUsuarios.find(u => u.id_usuario === id);
    const card = document.getElementById(`user-${id}`);

    card.innerHTML = `
        <form onsubmit="salvarEdicao(event, ${id})">
            <div><strong>Nome:</strong> <input required id="edit-nome-${id}" value="${usuario.nome}"></div>
            <div><strong>Email:</strong> <input required id="edit-email-${id}" value="${usuario.email}"></div>
            <div><strong>Tipo:</strong> 
                <select id="edit-tipo-${id}">
                    <option ${usuario.tipo === 'PROFESSOR' ? 'selected' : ''}>PROFESSOR</option>
                    <option ${usuario.tipo === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
                </select>
            </div>
            <div class="actions">
                <button type="submit">Salvar</button>
                <button type="button" onclick="cancelarEdicao(${id})">Cancelar</button>
            </div>
        </form>
    `;
}

function cancelarEdicao(id) {
    const usuario = todosUsuarios.find(u => u.id_usuario === id);
    document.getElementById(`user-${id}`).outerHTML = criarCardUsuario(usuario);
}

async function salvarEdicao(event, id) {
    event.preventDefault();

    const editData = {
        nome: document.getElementById(`edit-nome-${id}`).value,
        email: document.getElementById(`edit-email-${id}`).value,
        tipo: document.getElementById(`edit-tipo-${id}`).value
    };

    try {
        await fetchJSON(`${API_BASE}/usuario/updatePartial/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editData)
        });

        showMessage('Usuário atualizado!', 'success');

        Object.assign(todosUsuarios.find(u => u.id_usuario === id), editData);

        cancelarEdicao(id);
    } catch (e) {
        showMessage(`Erro ao salvar: ${e.message}`, 'error');
    }
}

async function alterarStatus(id) {
    const usuario = todosUsuarios.find(u => u.id_usuario === id);
    const novoStatus = !usuario.status_usuario;

    if (!confirm(`Deseja realmente ${novoStatus ? 'reativar' : 'desativar'}?`)) return;

    try {
        await fetchJSON(`${API_BASE}/usuario/updatePartial/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_usuario: novoStatus })
        });

        showMessage('Status atualizado!', 'success');
        usuario.status_usuario = novoStatus;

        cancelarEdicao(id);

    } catch (e) {
        showMessage(`Erro ao alterar status: ${e.message}`, 'error');
    }
}
