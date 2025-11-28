const API_BASE = 'http://localhost:3000/api';

// --- 1. AUTENTICAÇÃO E UI INICIAL ---
document.addEventListener('DOMContentLoaded', async () => {
    const usuarioId = localStorage.getItem('usuario_id');
    const usuarioTipo = localStorage.getItem('usuario_tipo');
    const usuarioNome = localStorage.getItem('usuario_nome');

    if (!usuarioId || usuarioTipo !== 'ADMIN') {
        alert("Acesso restrito a administradores.");
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name-display').innerText = usuarioNome;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioNome)}&background=0D6EFD&color=fff`;

    // Carregamentos iniciais
    await Promise.all([
        carregarSalasEDropdown(),
        carregarRecursosEDropdown(),
        carregarTodasSalas()
    ]);
});

// Elementos DOM
const formRecurso = document.getElementById('formRecurso');
const msgRecurso = document.getElementById('msgRecurso');
const formVinculo = document.getElementById('formVinculo');
const msgVinculo = document.getElementById('msgVinculo');
const selectSala = document.getElementById('selectSala');
const selectRecurso = document.getElementById('selectRecurso');
const listaDiv = document.getElementById('listaGerenciamentoSalas');

let todasSalas = [];

// --- 2. HELPERS DE UI ---
function showMessage(element, text, type) {
    // type: 'success' (verde) ou 'danger' (vermelho)
    element.innerHTML = `<div class="alert alert-${type} py-2 px-3 fs-6 mb-0" role="alert">${text}</div>`;
    setTimeout(() => { element.innerHTML = ''; }, 4000);
}

// --- 3. LÓGICA DO MODAL DE CADASTRO (NOVO) ---

// Abrir Modal e Carregar Checkboxes
async function abrirModalSala() {
    const modal = new bootstrap.Modal(document.getElementById('modalCadastroSala'));
    const container = document.getElementById('checkbox_recursos');

    // Limpa e mostra loading
    container.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div></div>';
    document.getElementById('msgModalSala').innerHTML = ''; // Limpa erros anteriores

    try {
        const response = await fetch(`${API_BASE}/recurso/findAll`);
        const result = await response.json();

        container.innerHTML = ''; // Limpa loading

        if (result.sucesso && result.data) {
            if (result.data.length === 0) {
                container.innerHTML = '<small class="text-muted">Nenhum recurso cadastrado no sistema.</small>';
            } else {
                result.data.forEach(recurso => {
                    const div = document.createElement('div');
                    div.className = 'form-check';
                    div.innerHTML = `
                                <input class="form-check-input" type="checkbox" id="modal_rec_${recurso.id_recurso}" value="${recurso.id_recurso}">
                                <label class="form-check-label" for="modal_rec_${recurso.id_recurso}">
                                    ${recurso.nome}
                                </label>
                            `;
                    container.appendChild(div);
                });
            }
        }
    } catch (error) {
        container.innerHTML = '<div class="text-danger small">Erro ao carregar recursos.</div>';
    }

    modal.show();
}

// Salvar Nova Sala
document.getElementById('formSala').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nome = document.getElementById('nomeNovaSala').value;
    const capacidade = parseInt(document.getElementById('capacidadeNovaSala').value);
    const msgModal = document.getElementById('msgModalSala');

    // Coleta recursos marcados no checkbox
    const recursosSelecionados = [];
    document.querySelectorAll('#checkbox_recursos input[type="checkbox"]:checked').forEach(cb => {
        recursosSelecionados.push(parseInt(cb.value));
    });

    const salaData = {
        nome: nome,
        capacidade: capacidade,
        status: 'DISPONIVEL',
        recursos: recursosSelecionados // Back-end deve tratar esse array
    };

    try {
        const response = await fetch(`${API_BASE}/sala/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(salaData)
        });
        const result = await response.json();

        if (result.sucesso) {
            alert('Sala cadastrada com sucesso!');

            // Fecha modal e limpa form
            const modalEl = document.getElementById('modalCadastroSala');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            document.getElementById('formSala').reset();

            // Atualiza a lista de salas
            await carregarTodasSalas();
            await carregarSalasEDropdown();
        } else {
            msgModal.innerHTML = `<div class="alert alert-danger py-2">${result.erro}</div>`;
        }
    } catch (error) {
        console.error(error);
        msgModal.innerHTML = `<div class="alert alert-danger py-2">Erro de conexão.</div>`;
    }
});


// --- 4. CARREGAMENTO DE DADOS GERAIS ---
async function carregarSalasEDropdown() {
    try {
        const resp = await fetch(`${API_BASE}/sala/findAll`);
        const json = await resp.json();
        if (!json.sucesso) throw new Error(json.erro);

        selectSala.innerHTML = '<option value="">Selecione uma sala</option>';
        json.data.forEach(sala => {
            const opt = document.createElement('option');
            opt.value = sala.id_sala;
            opt.textContent = `${sala.nome}`;
            selectSala.appendChild(opt);
        });
    } catch (e) { console.error(e); }
}

async function carregarRecursosEDropdown() {
    try {
        const resp = await fetch(`${API_BASE}/recurso/findAll`);
        const json = await resp.json();
        if (!json.sucesso) throw new Error(json.erro);

        selectRecurso.innerHTML = '<option value="">Selecione um recurso</option>';
        json.data.forEach(rec => {
            const opt = document.createElement('option');
            opt.value = rec.id_recurso;
            opt.textContent = rec.nome;
            selectRecurso.appendChild(opt);
        });
    } catch (e) { console.error(e); }
}

// --- 5. AÇÕES DE FORMULÁRIO (ADICIONAR RECURSO / VINCULAR) ---
formRecurso.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeRecurso').value.trim();

    try {
        const resp = await fetch(`${API_BASE}/recurso/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome })
        });
        const json = await resp.json();
        if (!resp.ok || !json.sucesso) throw new Error(json.erro || 'Erro ao salvar');

        showMessage(msgRecurso, 'Recurso salvo!', 'success');
        document.getElementById('nomeRecurso').value = '';
        await carregarRecursosEDropdown();
    } catch (e) {
        showMessage(msgRecurso, e.message, 'danger');
    }
});

formVinculo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fk_sala = selectSala.value;
    const fk_recurso = selectRecurso.value;

    try {
        const resp = await fetch(`${API_BASE}/sala-recurso/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_sala: Number(fk_sala), fk_recurso: Number(fk_recurso) })
        });
        const json = await resp.json();

        if (resp.status === 409) throw new Error('Este recurso já está na sala.');
        if (!resp.ok || !json.sucesso) throw new Error(json.erro || 'Erro ao vincular');

        showMessage(msgVinculo, 'Vínculo criado com sucesso!', 'success');
        carregarTodasSalas();
    } catch (e) {
        showMessage(msgVinculo, e.message, 'danger');
    }
});

// --- 6. LISTAGEM E GERENCIAMENTO DE SALAS ---
async function carregarTodasSalas() {
    listaDiv.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
    try {
        const response = await fetch(`${API_BASE}/sala/findAll`);
        const result = await response.json();
        if (response.ok && result.sucesso) {
            todasSalas = result.data;
            await exibirSalasParaGerenciamento(todasSalas);
        }
    } catch (error) {
        listaDiv.innerHTML = '<p class="text-danger text-center">Erro ao carregar salas.</p>';
    }
}

async function carregarSalasAtivas() {
    if (todasSalas.length === 0) await carregarTodasSalas();
    const filtradas = todasSalas.filter(s => s.status === 'DISPONIVEL' || s.status === 'OCUPADA');
    exibirSalasParaGerenciamento(filtradas);
}

async function carregarSalasInativas() {
    if (todasSalas.length === 0) await carregarTodasSalas();
    const filtradas = todasSalas.filter(s => s.status === 'DESATIVADA' || s.status === 'MANUTENCAO');
    exibirSalasParaGerenciamento(filtradas);
}

async function exibirSalasParaGerenciamento(salas) {
    if (salas.length === 0) {
        listaDiv.innerHTML = '<p class="text-center text-muted py-4">Nenhuma sala encontrada.</p>';
        return;
    }

    listaDiv.innerHTML = '';

    for (const sala of salas) {
        const salaDiv = document.createElement('div');
        salaDiv.id = `sala-${sala.id_sala}`;
        salaDiv.className = 'sala-item';

        let badgeClass = 'bg-success';
        if (sala.status === 'MANUTENCAO') badgeClass = 'bg-warning text-dark';
        if (sala.status === 'DESATIVADA') badgeClass = 'bg-danger';
        if (sala.status === 'OCUPADA') badgeClass = 'bg-primary';

        const btnStatusLabel = (sala.status === 'DISPONIVEL' || sala.status === 'OCUPADA') ? 'Desativar' : 'Reativar';
        const btnStatusClass = (sala.status === 'DISPONIVEL' || sala.status === 'OCUPADA') ? 'btn-outline-danger' : 'btn-outline-success';
        const fnStatus = (sala.status === 'DISPONIVEL' || sala.status === 'OCUPADA') ? 'desativarSala' : 'reativarSala';

        salaDiv.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="mb-1 fw-bold text-dark" id="sala-nome-${sala.id_sala}">
                                ${sala.nome} <span class="badge ${badgeClass} ms-2" style="font-size:0.7rem">${sala.status}</span>
                            </h5>
                            <small class="text-muted">Capacidade: <span id="sala-capacidade-${sala.id_sala}">${sala.capacidade}</span> pessoas</small>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="iniciarEdicaoSala(${sala.id_sala})"><i class="bi bi-pencil"></i> Editar</button>
                            <button class="btn btn-sm ${btnStatusClass}" onclick="${fnStatus}(${sala.id_sala})">${btnStatusLabel}</button>
                        </div>
                    </div>
                    
                    <div class="border-top pt-2">
                        <small class="fw-bold text-secondary d-block mb-1">Recursos:</small>
                        <div id="recursos-sala-${sala.id_sala}" class="d-flex flex-wrap">
                            <span class="text-muted small">Carregando recursos...</span>
                        </div>
                    </div>
                `;

        listaDiv.appendChild(salaDiv);
        carregarRecursosDaSala(sala.id_sala);
    }
}

async function carregarRecursosDaSala(idSala) {
    const container = document.getElementById(`recursos-sala-${idSala}`);
    try {
        const resp = await fetch(`${API_BASE}/sala-recurso/findById/${idSala}`);
        const json = await resp.json();

        if (!json.data || json.data.length === 0) {
            container.innerHTML = '<span class="text-muted small fst-italic">Sem recursos vinculados.</span>';
            return;
        }

        container.innerHTML = '';
        json.data.forEach(rec => {
            const badge = document.createElement('span');
            badge.className = 'badge-recurso';
            badge.innerHTML = `${rec.nome} <i class="bi bi-x-circle-fill btn-remove-recurso" onclick="removerRecursoSala(${idSala}, ${rec.id_recurso})" title="Remover"></i>`;
            container.appendChild(badge);
        });

    } catch (e) {
        container.innerHTML = '<span class="text-danger small">Erro ao buscar recursos.</span>';
    }
}

// --- 7. FUNÇÕES DE EDIÇÃO E EXCLUSÃO ---
function iniciarEdicaoSala(salaId) {
    const salaDiv = document.getElementById(`sala-${salaId}`);
    const nomeAtual = document.getElementById(`sala-nome-${salaId}`).childNodes[0].textContent.trim();
    const capacidadeAtual = document.getElementById(`sala-capacidade-${salaId}`).textContent;

    const salaObj = todasSalas.find(s => s.id_sala === salaId);
    const statusAtual = salaObj ? salaObj.status : 'DISPONIVEL';

    salaDiv.innerHTML = `
                <form onsubmit="salvarEdicaoSala(event, ${salaId})" class="bg-light p-3 rounded border">
                    <h6 class="fw-bold mb-3">Editar Sala</h6>
                    <div class="row g-2">
                        <div class="col-md-4">
                            <label class="form-label small">Nome</label>
                            <input type="text" class="form-control form-control-sm" id="edit-sala-nome-${salaId}" value="${nomeAtual}" required>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small">Capacidade</label>
                            <input type="number" class="form-control form-control-sm" id="edit-sala-capacidade-${salaId}" value="${capacidadeAtual}" required>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small">Status</label>
                            <select class="form-select form-select-sm" id="edit-sala-status-${salaId}">
                                <option value="DISPONIVEL" ${statusAtual === 'DISPONIVEL' ? 'selected' : ''}>Disponível</option>
                                <option value="OCUPADA" ${statusAtual === 'OCUPADA' ? 'selected' : ''}>Ocupada</option>
                                <option value="MANUTENCAO" ${statusAtual === 'MANUTENCAO' ? 'selected' : ''}>Manutenção</option>
                                <option value="DESATIVADA" ${statusAtual === 'DESATIVADA' ? 'selected' : ''}>Desativada</option>
                            </select>
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                            <button type="submit" class="btn btn-sm btn-primary w-100 mb-1">Salvar</button>
                        </div>
                        <div class="col-12 text-end">
                            <button type="button" class="btn btn-sm btn-link text-secondary" onclick="carregarTodasSalas()">Cancelar</button>
                        </div>
                    </div>
                </form>
            `;
}

async function salvarEdicaoSala(event, salaId) {
    event.preventDefault();
    const editData = {
        nome: document.getElementById(`edit-sala-nome-${salaId}`).value,
        capacidade: parseInt(document.getElementById(`edit-sala-capacidade-${salaId}`).value),
        status: document.getElementById(`edit-sala-status-${salaId}`).value
    };

    try {
        const resp = await fetch(`${API_BASE}/sala/updatePartial/${salaId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editData)
        });
        const json = await resp.json();
        if (!resp.ok || !json.sucesso) throw new Error(json.erro);

        carregarTodasSalas();
    } catch (error) {
        alert("Erro ao atualizar: " + error.message);
    }
}

async function desativarSala(salaId) {
    if (!confirm('Tem certeza? A sala não poderá receber novas reservas.')) return;
    alterarStatusSala(salaId, 'DESATIVADA');
}

async function reativarSala(salaId) {
    alterarStatusSala(salaId, 'DISPONIVEL');
}

async function alterarStatusSala(salaId, novoStatus) {
    try {
        const resp = await fetch(`${API_BASE}/sala/updatePartial/${salaId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        const json = await resp.json();
        if (!json.sucesso) throw new Error(json.erro);

        carregarTodasSalas();
    } catch (e) { console.error(e); }
}

async function removerRecursoSala(salaId, recursoId) {
    if (!confirm("Remover este recurso da sala?")) return;
    try {
        const resp = await fetch(`${API_BASE}/sala-recurso/remove`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fk_sala: Number(salaId), fk_recurso: Number(recursoId) })
        });
        const json = await resp.json();
        if (!json.sucesso) throw new Error(json.erro);

        carregarRecursosDaSala(salaId);
    } catch (e) { alert("Erro ao remover: " + e.message); }
}

// --- 8. MENU MOBILE ---
const wrapper = document.getElementById("wrapper");
document.getElementById("menu-toggle").onclick = (e) => {
    e.stopPropagation();
    wrapper.classList.toggle("toggled");
    document.getElementById("overlay").style.display = wrapper.classList.contains("toggled") ? "block" : "none";
};
function fecharMenu() {
    wrapper.classList.remove("toggled");
    document.getElementById("overlay").style.display = "none";
}
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}