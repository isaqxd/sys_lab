const API_BASE = 'http://localhost:3000/api';
let todasReservas = [];
let mapaSalas = {};
let mapaHorarios = {};
let mapaUsuarios = {};

// 1. Inicialização e Auth
document.addEventListener('DOMContentLoaded', async () => {
    const usuarioNome = localStorage.getItem('usuario_nome');
    const usuarioTipo = localStorage.getItem('usuario_tipo');
    const usuarioId = localStorage.getItem('usuario_id');

    if (!usuarioId) {
        window.location.href = 'index.html';
        return;
    }

    // Verificar se é admin
    if (usuarioTipo !== 'ADMIN') {
        mostrarMensagem('Acesso negado. Apenas administradores podem gerenciar reservas.', 'danger');
        setTimeout(() => {
            window.location.href = 'portal_professor.html';
        }, 2000);
        return;
    }

    // Preenche Header
    document.getElementById('user-name-display').innerText = usuarioNome;
    document.getElementById('user-type-display').innerText = usuarioTipo;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioNome)}&background=0D6EFD&color=fff`;

    // Carrega dados auxiliares e reservas
    await carregarDadosAuxiliares();
    await carregarTodasReservas();
});

// 2. Funções auxiliares
function toggleLoading(show) {
    const loading = document.getElementById('loading-reservas');
    const container = document.getElementById('reservas-container');
    loading.style.display = show ? 'block' : 'none';
    container.style.display = show ? 'none' : 'block';
}

function mostrarMensagem(texto, tipo = 'info') {
    const messageDiv = document.getElementById('message');
    const messageText = document.getElementById('message-text');

    messageText.innerText = texto;
    messageDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    messageDiv.style.display = 'block';

    if (tipo === 'success' || tipo === 'info') {
        setTimeout(() => {
            fecharMensagem();
        }, 5000);
    }
}

function fecharMensagem() {
    document.getElementById('message').style.display = 'none';
}

async function fetchJSON(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.erro || result.message || `HTTP error! status: ${response.status}`);
        }

        if (!result.sucesso) {
            throw new Error(result.erro || result.message || 'Operação não foi bem-sucedida');
        }

        return result.data;
    } catch (error) {
        console.error('Erro no fetchJSON:', error);
        throw error;
    }
}

function formatarData(dataString) {
    if (!dataString) return 'N/A';
    try {
        const data = new Date(dataString);
        if (isNaN(data.getTime())) return 'N/A';
        return data.toLocaleDateString('pt-BR');
    } catch (e) {
        return 'N/A';
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'CONFIRMADA': return 'status-confirmada';
        case 'PENDENTE': return 'status-pendente';
        case 'CANCELADA': return 'status-cancelada';
        default: return 'status-pendente';
    }
}

// 3. Carregar dados auxiliares
async function carregarDadosAuxiliares() {
    try {
        const [salas, horarios, usuarios] = await Promise.all([
            fetchJSON(`${API_BASE}/sala/findAll`),
            fetchJSON(`${API_BASE}/horario/findAll`),
            fetchJSON(`${API_BASE}/usuario/findAll`)
        ]);

        // Mapear IDs para nomes
        salas.forEach(s => mapaSalas[s.id_sala] = s.nome);
        horarios.forEach(h => mapaHorarios[h.id_horario] = `${h.turno} (${h.hora_inicio.slice(0, 5)}-${h.hora_fim.slice(0, 5)})`);
        usuarios.forEach(u => mapaUsuarios[u.id_usuario] = u.nome);

    } catch (e) {
        console.error('Erro ao carregar dados auxiliares:', e);
        mostrarMensagem('Erro ao carregar dados auxiliares', 'danger');
    }
}

// 4. Carregar reservas
async function carregarTodasReservas() {
    toggleLoading(true);
    try {
        todasReservas = await fetchJSON(`${API_BASE}/reserva/findAll`);

        // Ordenar por data mais recente primeiro
        todasReservas.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));

        exibirReservas(todasReservas, 'Todas as Reservas');
        mostrarMensagem(`${todasReservas.length} reservas carregadas com sucesso`, 'success');
    } catch (e) {
        console.error('Erro ao carregar reservas:', e);
        mostrarMensagem('Erro ao carregar reservas: ' + e.message, 'danger');
        exibirReservas([]);
    } finally {
        toggleLoading(false);
    }
}

function filtrarReservas(status) {
    if (!todasReservas.length) return mostrarMensagem('Carregue as reservas primeiro', 'warning');

    const reservasFiltradas = todasReservas.filter(r => r.status === status);
    const titulo = `Reservas ${status.toLowerCase()}`;
    exibirReservas(reservasFiltradas, titulo);
}

// 5. Exibir reservas
function exibirReservas(reservas, titulo = 'Reservas') {
    const container = document.getElementById('reservas-lista');
    document.getElementById('reservas-title').textContent = titulo;
    document.getElementById('reservas-count').textContent = `(${reservas.length})`;

    if (!reservas.length) {
        container.innerHTML = '<p class="text-center text-muted py-4">Nenhuma reserva encontrada</p>';
        return;
    }

    container.innerHTML = reservas.map(reserva => criarCardReserva(reserva)).join('');
}

function criarCardReserva(reserva) {
    const { id_reserva, fk_sala, fk_horario, fk_usuario, data_reserva, status, motivo, data_criacao } = reserva;

    const nomeSala = mapaSalas[fk_sala] || `Sala ID ${fk_sala}`;
    const nomeHorario = mapaHorarios[fk_horario] || `Horário ID ${fk_horario}`;
    const nomeUsuario = mapaUsuarios[fk_usuario] || `Usuário ID ${fk_usuario}`;
    const dataReservaFormatada = formatarData(data_reserva);
    const dataCriacaoFormatada = formatarData(data_criacao);
    const statusClass = getStatusClass(status);

    return `
                <div id="reserva-${id_reserva}" class="reserva-card">
                    <div class="reserva-info">
                        <strong>Sala:</strong> ${nomeSala}
                    </div>
                    <div class="reserva-info">
                        <strong>Usuário:</strong> ${nomeUsuario}
                    </div>
                    <div class="reserva-info">
                        <strong>Data:</strong> ${dataReservaFormatada}
                    </div>
                    <div class="reserva-info">
                        <strong>Horário:</strong> ${nomeHorario}
                    </div>
                    <div class="reserva-info">
                        <strong>Status:</strong> 
                        <span class="status-badge ${statusClass}">${status}</span>
                    </div>
                    <div class="reserva-info">
                        <strong>Motivo:</strong> ${motivo || 'Não informado'}
                    </div>
                    <div class="reserva-info">
                        <strong>Criada em:</strong> ${dataCriacaoFormatada}
                    </div>
                    <div class="reserva-actions mt-3">
                        ${status === 'PENDENTE' ? `
                            <button class="btn btn-sm btn-success me-1" onclick="alterarStatusReserva(${id_reserva}, 'CONFIRMADA')">
                                <i class="bi bi-check"></i> Confirmar
                            </button>
                        ` : ''}
                        ${status !== 'CANCELADA' ? `
                            <button class="btn btn-sm btn-danger" onclick="alterarStatusReserva(${id_reserva}, 'CANCELADA')">
                                <i class="bi bi-x"></i> Cancelar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
}

// 6. Alterar status da reserva
async function alterarStatusReserva(idReserva, novoStatus) {
    const reserva = todasReservas.find(r => r.id_reserva === idReserva);
    const acao = novoStatus === 'CONFIRMADA' ? 'confirmar' : 'cancelar';

    if (!confirm(`Deseja realmente ${acao} esta reserva?`)) return;

    try {
        await fetchJSON(`${API_BASE}/reserva/parcialUpdate/${idReserva}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });

        mostrarMensagem(`Reserva ${acao === 'confirmar' ? 'confirmada' : 'cancelada'} com sucesso!`, 'success');

        // Atualiza o status na lista local
        reserva.status = novoStatus;

        // Recarrega as reservas para atualizar a exibição
        await carregarTodasReservas();

    } catch (e) {
        mostrarMensagem(`Erro ao ${acao} reserva: ${e.message}`, 'danger');
    }
}

// 7. Lógica do menu mobile
const wrapper = document.getElementById("wrapper");
const overlay = document.getElementById("overlay");

document.getElementById("menu-toggle").onclick = function (e) {
    e.stopPropagation();
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