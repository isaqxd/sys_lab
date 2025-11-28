
const API_BASE = 'http://localhost:3000/api';

// 1. Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuario_id');
    const usuarioNome = localStorage.getItem('usuario_nome');
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    if (!usuarioId) {
        window.location.href = 'index.html';
        return;
    }

    // Header Info
    document.getElementById('user-name-display').innerText = usuarioNome;
    document.getElementById('user-type-display').innerText = usuarioTipo;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioNome)}&background=0D6EFD&color=fff`;

    carregarReservas(usuarioId);
});

// 2. Busca Dados da API Específica do Professor
async function carregarReservas(id) {
    try {
        // Usa a rota que já separa por categoria
        const response = await fetch(`${API_BASE}/reserva/professor/${id}`);
        const json = await response.json();

        if (!json.sucesso) throw new Error(json.erro);

        // Renderiza cada seção
        renderizarLista(json.data.atuais, 'container-atuais', true); // true = pode cancelar
        renderizarLista(json.data.passadas, 'container-passadas', false);
        renderizarLista(json.data.canceladas, 'container-canceladas', false);

    } catch (error) {
        console.error(error);
        mostrarMensagem('Erro ao carregar suas reservas.', 'danger');
    }
}

// 3. Renderiza os Cards
function renderizarLista(lista, containerId, permiteCancelar) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!lista || lista.length === 0) {
        container.innerHTML = `<div class="col-12 text-muted small ps-3">Nenhuma reserva nesta categoria.</div>`;
        return;
    }

    lista.forEach(r => {
        const dataFormatada = new Date(r.data_reserva).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        // Define classes visuais
        let borderClass = 'border-passada';
        let badgeClass = 'bg-secondary';

        if (r.status === 'CONFIRMADA') {
            borderClass = 'border-confirmada';
            badgeClass = 'bg-success';
        } else if (r.status === 'CANCELADA') {
            borderClass = 'border-cancelada';
            badgeClass = 'bg-danger';
        }

        // Botão de Cancelar (Aparece só se permitido e status não for cancelado)
        let btnCancelar = '';
        if (permiteCancelar && r.status !== 'CANCELADA') {
            btnCancelar = `
                        <button onclick="cancelarReserva(${r.id_reserva})" class="btn btn-sm btn-outline-danger mt-2">
                            <i class="bi bi-trash"></i> Cancelar Reserva
                        </button>
                    `;
        }

        const html = `
                    <div class="col-md-6 col-xl-4">
                        <div class="reserva-card ${borderClass}">
                            <div class="reserva-header">
                                <div class="reserva-sala">${r.nome_sala}</div>
                                <span class="badge ${badgeClass}">${r.status}</span>
                            </div>
                            
                            <div class="reserva-data">
                                <i class="bi bi-calendar-event"></i> ${dataFormatada}
                            </div>
                            
                            <div class="reserva-data mt-1">
                              <i class="bi bi-clock"></i> 
                                ${r.nome_turno} (${r.hora_inicio.slice(0, 5)} - ${r.hora_fim.slice(0, 5)})
                            </div>

                            <div class="reserva-motivo">
                                <i class="bi bi-chat-quote me-1"></i> ${r.motivo || 'Sem motivo informado'}
                            </div>

                            <div class="d-flex justify-content-end">
                                ${btnCancelar}
                            </div>
                        </div>
                    </div>
                `;
        container.innerHTML += html;
    });
}

// 4. Lógica de Cancelamento
async function cancelarReserva(idReserva) {
    if (!confirm("Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.")) return;

    try {
        // Usa a rota de atualização parcial (PATCH)
        const response = await fetch(`${API_BASE}/reserva/parcialUpdate/${idReserva}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELADA' })
        });

        const json = await response.json();

        if (json.sucesso) {
            mostrarMensagem("Reserva cancelada com sucesso!", "success");
            // Recarrega a lista
            const usuarioId = localStorage.getItem('usuario_id');
            carregarReservas(usuarioId);
        } else {
            throw new Error(json.erro);
        }
    } catch (error) {
        console.error(error);
        mostrarMensagem("Erro ao cancelar: " + error.message, "danger");
    }
}

// UI Utils
function mostrarMensagem(texto, tipo) {
    const msg = document.getElementById('message');
    const txt = document.getElementById('message-text');
    txt.innerText = texto;
    msg.className = `alert alert-${tipo} alert-dismissible fade show mt-3`;
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 4000);
}

// Menu Mobile
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