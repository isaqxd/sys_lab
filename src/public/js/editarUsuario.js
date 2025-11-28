const API_BASE = 'http://localhost:3000/api';
let todosUsuarios = [];

function getStatusUsuario(u) {
    const s = u.status_usuario;

    if (s === true || s === 1 || s === "1" || s === "true") return true;
    if (s === false || s === 0 || s === "0" || s === "false") return false;

    return true;
}

function normalizarStatusLista(lista) {
    return lista.map(u => ({
        ...u,
        status_usuario: getStatusUsuario(u)
    }));
}

document.addEventListener('DOMContentLoaded', async () => {
    const nome = localStorage.getItem('usuario_nome');
    const tipo = localStorage.getItem('usuario_tipo');
    const id = localStorage.getItem('usuario_id');

    if (!id) return window.location.href = "index.html";

    if (tipo !== 'ADMIN') {
        mostrarMensagem('Apenas administradores podem acessar.', 'danger');
        setTimeout(() => window.location.href = 'portal_professor.html', 1500);
        return;
    }

    document.getElementById('user-name-display').innerText = nome;
    document.getElementById('user-type-display').innerText = tipo;
    document.getElementById('user-avatar').src =
        `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=0D6EFD&color=fff`;

    await carregarTodosUsuarios();
});

function toggleLoading(show) {
    document.getElementById('loading-users').style.display = show ? 'block' : 'none';
    document.getElementById('users-container').style.display = show ? 'none' : 'block';
}

function mostrarMensagem(texto, tipo = 'info') {
    const box = document.getElementById('message');
    const msg = document.getElementById('message-text');

    msg.innerText = texto;
    box.className = `alert alert-${tipo === 'error' ? 'danger' : tipo} alert-dismissible fade show`;
    box.style.display = 'block';

    if (['success', 'info'].includes(tipo)) {
        setTimeout(() => box.style.display = 'none', 5000);
    }
}

async function fetchJSON(url, options = {}) {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok || !result.sucesso) {
        throw new Error(result.erro || result.message || 'Erro desconhecido');
    }

    return result.data;
}

// ================= LISTAGEM =================
async function carregarTodosUsuarios() {
    toggleLoading(true);
    try {
        todosUsuarios = await fetchJSON(`${API_BASE}/usuario/findAll`);
        todosUsuarios.sort((a, b) => {
            return (getStatusUsuario(b) ? 1 : 0) - (getStatusUsuario(a) ? 1 : 0);
        });

        exibirUsuarios(todosUsuarios, 'Todos os Usuários');
    } catch (e) {
        console.error('Erro ao carregar usuários:', e);
        mostrarMensagem('Erro ao carregar usuários: ' + e.message, 'danger');
        exibirUsuarios([]);
    } finally {
        toggleLoading(false);
    }
}

function carregarUsuariosAtivos() {
    if (!todosUsuarios.length) return mostrarMensagem('Carregue os usuários primeiro', 'warning');

    const usuariosAtivos = todosUsuarios
        .filter(u => getStatusUsuario(u))
        .sort((a, b) => a.nome.localeCompare(b.nome)); // opcional

    exibirUsuarios(usuariosAtivos, 'Usuários Ativos');
}

function carregarUsuariosInativos() {
    if (!todosUsuarios.length) return mostrarMensagem('Carregue os usuários primeiro', 'warning');

    const usuariosInativos = todosUsuarios
        .filter(u => !getStatusUsuario(u))
        .sort((a, b) => a.nome.localeCompare(b.nome));

    exibirUsuarios(usuariosInativos, 'Usuários Inativos');
}
// ================= PESQUISA =================

async function pesquisarPorEmail() {
    const email = document.getElementById('search-email').value.trim();
    if (!email) return mostrarMensagem('Digite um e-mail.', 'warning');

    toggleLoading(true);
    try {
        const resultado = await fetchJSON(`${API_BASE}/usuario/findByEmail?email=${encodeURIComponent(email)}`);

        if (resultado) {
            exibirUsuarios([resultado], `Resultado para: ${email}`);
        } else {
            exibirUsuarios([], `Nenhum resultado para: ${email}`);
        }
    } catch {
        exibirUsuarios([], `Nenhum resultado para: ${email}`);
        mostrarMensagem('Nenhum usuário encontrado.', 'info');
    } finally {
        toggleLoading(false);
    }
}

function limparPesquisa() {
    document.getElementById('search-email').value = '';
    carregarTodosUsuarios();
}
// ================= CARDS =================
function exibirUsuarios(lista, titulo) {
    const div = document.getElementById('users-container');
    document.getElementById('page-title').textContent = titulo;
    document.getElementById('list-title').textContent = titulo;
    if (!lista.length) {
        div.innerHTML = `<p class="text-center text-muted py-4">Nenhum usuário encontrado</p>`;
        return;
    }
    div.innerHTML = lista.map(u => criarCardUsuario(u)).join('');
}

function criarCardUsuario(usuario) {
    const ativo = usuario.status_usuario;
    const status = ativo ? "Ativo" : "Inativo";
    const badge = ativo ? "status-active" : "status-inactive";
    return `
        <div id="user-${usuario.id_usuario}" class="user-card">
            <div class="user-view">
                <div><strong>Nome:</strong> ${usuario.nome}</div>
                <div><strong>Email:</strong> ${usuario.email}</div>
                <div><strong>Tipo:</strong> <span class="type-badge">${usuario.tipo}</span></div>
                <div><strong>Status:</strong> <span class="status-badge ${badge}">${status}</span></div>
            </div>
            <div class="user-actions">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="iniciarEdicao(${usuario.id_usuario})">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-sm ${ativo ? 'btn-outline-danger' : 'btn-outline-success'}" onclick="alterarStatus(${usuario.id_usuario})">
                    <i class="bi ${ativo ? 'bi-person-x' : 'bi-person-check'}"></i>
                    ${ativo ? 'Desativar' : 'Reativar'}
                </button>
            </div>
        </div>
    `;
}
// ================= EDIÇÃO =================
function iniciarEdicao(id) {
    const u = todosUsuarios.find(x => x.id_usuario === id);

    document.getElementById(`user-${id}`).innerHTML = `
        <form onsubmit="salvarEdicao(event, ${id})" class="edit-form">
            <div class="form-group">
                <label>Nome:</label>
                <input type="text" id="edit-nome-${id}" class="form-control" value="${u.nome}" required>
            </div>

            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="edit-email-${id}" class="form-control" value="${u.email}" required>
            </div>

            <div class="form-group">
                <label>Tipo:</label>
                <select id="edit-tipo-${id}" class="form-select">
                    <option value="PROFESSOR" ${u.tipo === "PROFESSOR" ? "selected" : ""}>PROFESSOR</option>
                    <option value="ADMIN" ${u.tipo === "ADMIN" ? "selected" : ""}>ADMIN</option>
                </select>
            </div>

            <div class="user-actions">
                <button class="btn btn-sm btn-success">
                    <i class="bi bi-check"></i> Salvar
                </button>
                <button
                    type="button"
                    class="btn btn-sm btn-secondary"
                    onclick="cancelarEdicao(${id})">
                    <i class="bi bi-x"></i> Cancelar
                </button>
            </div>
        </form>
    `;
}

function cancelarEdicao(id) {
    const usuario = todosUsuarios.find(u => u.id_usuario === id);
    document.getElementById(`user-${id}`).outerHTML = criarCardUsuario(usuario);
}

async function salvarEdicao(evt, id) {
    evt.preventDefault();

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

        mostrarMensagem('Usuário atualizado!', 'success');

        Object.assign(todosUsuarios.find(u => u.id_usuario === id), editData);

        cancelarEdicao(id);
    } catch (e) {
        mostrarMensagem('Erro ao salvar: ' + e.message, 'danger');
    }
}

// ================= STATUS =================
async function alterarStatus(id) {
    const usuario = todosUsuarios.find(u => u.id_usuario === id);
    const novoStatus = !usuario.status_usuario;

    if (!confirm(`Deseja realmente ${novoStatus ? "reativar" : "desativar"} ${usuario.nome}?`)) return;

    try {
        await fetchJSON(`${API_BASE}/usuario/updatePartial/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_usuario: novoStatus })
        });

        usuario.status_usuario = novoStatus;
        mostrarMensagem('Status atualizado!', 'success');
        cancelarEdicao(id);

    } catch (e) {
        mostrarMensagem('Erro ao alterar status: ' + e.message, 'danger');
    }
}

// ================= MENU MOBILE =================
const wrapper = document.getElementById("wrapper");
const overlay = document.getElementById("overlay");

document.getElementById("menu-toggle").onclick = () => {
    wrapper.classList.toggle("toggled");
    overlay.style.display = wrapper.classList.contains("toggled") ? "block" : "none";
};

function fecharMenu() {
    wrapper.classList.remove("toggled");
    overlay.style.display = "none";
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
