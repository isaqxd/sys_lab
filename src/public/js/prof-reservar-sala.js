const API_BASE = 'http://localhost:3000/api';
let salaSelecionadaData = null;

// --- 1. CONFIGURAÇÃO INICIAL (AUTH & CALENDÁRIO) ---
document.addEventListener('DOMContentLoaded', () => {
    // A. Verifica Login e Preenche Sidebar/Header
    const usuarioNome = localStorage.getItem('usuario_nome');
    const usuarioTipo = localStorage.getItem('usuario_tipo');
    const usuarioId = localStorage.getItem('usuario_id');
    // --- LÓGICA DE REDIRECIONAMENTO INTELIGENTE ---
    let urlDashboard = 'prof-portal.html'; // Padrão (Professor)

    if (usuarioTipo === 'ADMIN') {
        urlDashboard = 'portal_admin.html'; // Nome do arquivo do Admin
    }
    // Atualiza os links na tela
    const linkSidebar = document.getElementById('link-dashboard-sidebar');
    const linkModal = document.getElementById('link-dashboard-modal');

    if (linkSidebar) linkSidebar.href = urlDashboard;
    if (linkModal) linkModal.href = urlDashboard;
    if (!usuarioId) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = 'index.html';
        return;
    }

    // Preenche o input oculto para a reserva funcionar
    document.getElementById('fk_usuario').value = usuarioId;

    // Infos do Header
    document.getElementById('user-name-display').innerText = usuarioNome;
    document.getElementById('user-type-display').innerText = usuarioTipo;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioNome)}&background=0D6EFD&color=fff`;

    if (usuarioTipo === 'ADMIN') document.getElementById('menu-admin').style.display = 'block';

    // B. Inicializa Flatpickr
    flatpickr("#data_reserva", {
        locale: "pt",
        altInput: true,
        altFormat: "d/m/Y",
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: new Date().fp_incr(14),
        defaultDate: "today",
        disableMobile: "true"
    });
});

// --- 2. LÓGICA DE RESERVA ---
const mapaTurnos = { 1: "MANHÃ (09:00 - 12:00)", 2: "TARDE (13:00 - 18:00)", 3: "NOITE (19:00 - 22:00)" };
const iconesTurnos = {
    1: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e67e22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M12 17a5 5 0 0 0 5-5H7a5 5 0 0 0 5 5Z"/><path d="M2 12h2"/><path d="M22 22H2"/></svg>`,
    2: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>`,
    3: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2c3e50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
};

async function buscarSalas() {
    const dataInput = document.getElementById("data_reserva").value;
    const horarioFiltro = document.getElementById("horario").value;
    const areaPrincipal = document.getElementById("area-salas-dinamica");
    const loading = document.getElementById("loading");
    const msgSemSalas = document.getElementById("msg-sem-salas");

    areaPrincipal.innerHTML = "";
    msgSemSalas.style.display = "none";
    document.getElementById("btn-prosseguir").disabled = true;
    document.getElementById("txt-selecao").innerText = "Nenhuma seleção";
    salaSelecionadaData = null;

    if (!dataInput) { alert("Selecione a data primeiro."); return; }

    loading.style.display = "block";

    try {
        const [resSalas, resReservas] = await Promise.all([
            fetch(`${API_BASE}/sala/findAll`),
            fetch(`${API_BASE}/reserva/findAll`)
        ]);
        const jsonSalas = await resSalas.json();
        const jsonReservas = await resReservas.json();
        loading.style.display = "none";

        if (!jsonSalas.sucesso || !jsonSalas.data) {
            msgSemSalas.innerText = "Erro ao buscar salas.";
            msgSemSalas.style.display = "block";
            return;
        }

        const reservasDoDia = (jsonReservas.data || []).filter(r => {
            const dataDb = r.data_reserva.toString().substring(0, 10);
            return dataDb === dataInput && r.status === 'CONFIRMADA';
        });

        let salasVisiveis = 0;
        jsonSalas.data.forEach(sala => {
            if (sala.status !== 'DISPONIVEL') return;
            salasVisiveis++;

            const divBloco = document.createElement('div');
            divBloco.className = 'bloco-sala';
            divBloco.innerHTML = `<h3 class="titulo-sala">${sala.nome}</h3>`;

            const divGrupo = document.createElement('div');
            divGrupo.className = 'grupo-turnos';
            const turnosParaMostrar = (horarioFiltro === "0") ? [1, 2, 3] : [parseInt(horarioFiltro)];

            turnosParaMostrar.forEach(idTurno => {
                const card = document.createElement('div');
                const estaOcupada = reservasDoDia.some(r => r.fk_sala === sala.id_sala && r.fk_horario === idTurno);

                if (estaOcupada) {
                    card.className = 'sala-card ocupada';
                    card.innerHTML = `<div class="info-sala"><span class="nome-turno">OCUPADO</span><span class="cap-sala">${mapaTurnos[idTurno]}</span></div><div class="icone-sala">${iconesTurnos[idTurno]}</div>`;
                } else {
                    card.className = 'sala-card';
                    card.onclick = () => selecionarSala(card, { fk_sala: sala.id_sala, fk_horario: idTurno, nomeSala: sala.nome, nomeTurno: mapaTurnos[idTurno] });
                    card.innerHTML = `<div class="info-sala"><span class="nome-turno">${mapaTurnos[idTurno]}</span><span class="cap-sala">Cap: ${sala.capacidade}</span></div><div class="icone-sala">${iconesTurnos[idTurno]}</div>`;
                }
                divGrupo.appendChild(card);
            });
            divBloco.appendChild(divGrupo);
            areaPrincipal.appendChild(divBloco);
        });

        if (salasVisiveis === 0) {
            msgSemSalas.innerText = "Nenhuma sala disponível encontrada.";
            msgSemSalas.style.display = "block";
        }
    } catch (erro) {
        loading.style.display = "none";
        console.error(erro);
        msgSemSalas.innerText = "Erro ao conectar com servidor.";
        msgSemSalas.style.display = "block";
    }
}

function selecionarSala(elementoHtml, dados) {
    document.querySelectorAll('.sala-card').forEach(c => c.classList.remove('selecionada'));
    elementoHtml.classList.add('selecionada');
    salaSelecionadaData = dados;
    document.getElementById("txt-selecao").innerText = `${dados.nomeSala} - ${dados.nomeTurno}`;
    document.getElementById("btn-prosseguir").disabled = false;
}

// --- 3. MODAL E ENVIO ---
function abrirModalConfirmacao() {
    if (!salaSelecionadaData) return;

    document.getElementById('step-formulario').classList.remove('d-none');
    document.getElementById('step-sucesso').classList.add('d-none');
    document.getElementById('modal-footer-btns').classList.remove('d-none');
    document.getElementById('modal-footer-sucesso').classList.add('d-none');
    document.getElementById('btn-close-x').style.display = 'block';
    document.getElementById('msg-erro-modal').style.display = 'none';
    document.getElementById('modal-motivo').classList.remove('is-invalid');
    document.getElementById('modal-motivo').value = "";
    document.getElementById('btn-finalizar').disabled = false;
    document.getElementById('btn-finalizar').innerText = "Confirmar";

    const data = document.getElementById("data_reserva").value;
    document.getElementById('resumo-sala').innerText = salaSelecionadaData.nomeSala;
    document.getElementById('resumo-turno').innerText = salaSelecionadaData.nomeTurno;
    document.getElementById('resumo-data').innerText = data.split('-').reverse().join('/');

    const modal = new bootstrap.Modal(document.getElementById('modalConfirmacao'));
    modal.show();
}

async function finalizarReserva() {
    const btn = document.getElementById('btn-finalizar');
    const msgErro = document.getElementById('msg-erro-modal');
    const motivoInput = document.getElementById('modal-motivo');

    if (!motivoInput.value.trim()) {
        motivoInput.classList.add('is-invalid');
        return;
    } else {
        motivoInput.classList.remove('is-invalid');
    }

    btn.disabled = true;
    btn.innerText = "Salvando...";
    msgErro.style.display = 'none';

    const payload = {
        fk_usuario: document.getElementById('fk_usuario').value,
        fk_sala: salaSelecionadaData.fk_sala,
        fk_horario: salaSelecionadaData.fk_horario,
        data_reserva: document.getElementById("data_reserva").value,
        motivo: motivoInput.value
    };

    try {
        const res = await fetch(`${API_BASE}/reserva/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();

        if (res.ok) {
            document.getElementById('step-formulario').classList.add('d-none');
            document.getElementById('id-reserva-final').innerText = json.data.id_reserva;
            document.getElementById('step-sucesso').classList.remove('d-none');
            document.getElementById('modal-footer-btns').classList.add('d-none');
            document.getElementById('modal-footer-sucesso').classList.remove('d-none');
            document.getElementById('btn-close-x').style.display = 'none';
        } else {
            let txt = json.erro || "Erro desconhecido";
            msgErro.innerText = txt;
            msgErro.style.display = 'block';
            btn.disabled = false;
            btn.innerText = "Confirmar";
        }
    } catch (e) {
        msgErro.innerText = "Erro de conexão.";
        msgErro.style.display = 'block';
        btn.disabled = false;
        btn.innerText = "Confirmar";
    }
}

// --- LÓGICA DO MENU MOBILE ---
const wrapper = document.getElementById("wrapper");
const overlay = document.getElementById("overlay");

// Botão de Abrir (Hamburger)
document.getElementById("menu-toggle").onclick = function (e) {
    e.stopPropagation(); // Evita conflitos de clique
    wrapper.classList.toggle("toggled");

    // Controla visibilidade do Overlay manual (opcional, pois o CSS já faz, 
    // mas ajuda a garantir consistência)
    if (wrapper.classList.contains("toggled")) {
        overlay.style.display = "block";
    } else {
        overlay.style.display = "none";
    }
};

// Função para fechar (chamada ao clicar no overlay)
function fecharMenu() {
    wrapper.classList.remove("toggled");
    overlay.style.display = "none";
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}