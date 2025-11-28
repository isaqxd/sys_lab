const API_BASE = 'http://localhost:3000/api';

// Mapas globais
let mapaSalas = {};
let mapaUsuarios = {};
let mapaTurnos = {};

// 1. Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const usuarioId = localStorage.getItem('usuario_id');
    const usuarioTipo = localStorage.getItem('usuario_tipo');
    const usuarioNome = localStorage.getItem('usuario_nome');

    if (!usuarioId || usuarioTipo !== 'ADMIN') {
        window.location.href = 'index.html';
        return;
    }

    // Header
    document.getElementById('user-name-display').innerText = usuarioNome;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioNome)}&background=0D6EFD&color=fff`;

    // Data de hoje no topo
    const hoje = new Date();
    document.getElementById('data-hoje').innerText = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    await carregarDadosDashboard();
});

// 2. Carregamento Geral
async function carregarDadosDashboard() {
    try {
        // Busca tudo em paralelo
        const [resSalas, resReservas, resUsuarios, resHorarios] = await Promise.all([
            fetch(`${API_BASE}/sala/findAll`),
            fetch(`${API_BASE}/reserva/findAll`),
            fetch(`${API_BASE}/usuario/findAll`),
            fetch(`${API_BASE}/horario/findAll`)
        ]);

        const jsonSalas = await resSalas.json();
        const jsonReservas = await resReservas.json();
        const jsonUsuarios = await resUsuarios.json();
        const jsonHorarios = await resHorarios.json();

        // Preenche mapas
        if (jsonSalas.sucesso) jsonSalas.data.forEach(s => mapaSalas[s.id_sala] = s);
        if (jsonUsuarios.sucesso) jsonUsuarios.data.forEach(u => mapaUsuarios[u.id_usuario] = u.nome);
        if (jsonHorarios.sucesso) jsonHorarios.data.forEach(h => mapaTurnos[h.id_horario] = h.turno);

        // Preenche KPIs de Salas
        const salas = jsonSalas.data || [];
        const manutencao = salas.filter(s => s.status === 'MANUTENCAO').length;
        const ativas = salas.filter(s => s.status === 'DISPONIVEL' || s.status === 'OCUPADA').length;

        document.getElementById('kpi-manutencao').innerText = manutencao;
        document.getElementById('kpi-salas-ativas').innerText = ativas;

        // Preenche Dados de Reservas
        processarReservas(jsonReservas.data || []);

    } catch (error) {
        console.error("Erro ao carregar dashboard", error);
    }
}

function processarReservas(reservas) {
    const hojeStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // KPIs
    const reservasHoje = reservas.filter(r => r.data_reserva.startsWith(hojeStr) && r.status !== 'CANCELADA');
    const pendentes = reservas.filter(r => r.status === 'PENDENTE');

    document.getElementById('kpi-hoje').innerText = reservasHoje.length;
    document.getElementById('kpi-pendentes').innerText = pendentes.length;

    // Tabela Hoje
    renderizarTabelaHoje(reservasHoje);

    // Gráfico (Últimos 7 dias ou Próximos 7 dias - vamos fazer Volume Semanal Geral)
    renderizarGrafico(reservas);
}

function renderizarTabelaHoje(reservasHoje) {
    const tbody = document.getElementById('tabela-hoje');
    tbody.innerHTML = '';

    if (reservasHoje.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">Nenhuma reserva agendada para hoje.</td></tr>`;
        return;
    }

    // Ordenar por horário
    reservasHoje.sort((a, b) => a.fk_horario - b.fk_horario);

    reservasHoje.forEach(r => {
        const nomeSala = mapaSalas[r.fk_sala] ? mapaSalas[r.fk_sala].nome : `ID ${r.fk_sala}`;
        const nomeProf = mapaUsuarios[r.fk_usuario] || 'Desconhecido';
        const turno = mapaTurnos[r.fk_horario] || 'Turno';

        let badge = `<span class="badge bg-success">Confirmada</span>`;
        if (r.status === 'PENDENTE') badge = `<span class="badge bg-warning text-dark">Pendente</span>`;

        const tr = `
                    <tr>
                        <td class="ps-4 fw-bold">${nomeSala}</td>
                        <td>${turno}</td>
                        <td>${nomeProf}</td>
                        <td>${badge}</td>
                    </tr>
                `;
        tbody.innerHTML += tr;
    });
}

function renderizarGrafico(todasReservas) {
    // Agrupar reservas por dia da semana (apenas confirmadas)
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const contagem = [0, 0, 0, 0, 0, 0, 0];

    todasReservas.forEach(r => {
        if (r.status === 'CONFIRMADA') {
            const data = new Date(r.data_reserva);
            const diaIndex = data.getDay(); // 0 a 6
            contagem[diaIndex]++;
        }
    });

    const ctx = document.getElementById('graficoSemanal').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: diasSemana,
            datasets: [{
                label: 'Reservas Totais',
                data: contagem,
                backgroundColor: '#4e73df',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Mobile Menu
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