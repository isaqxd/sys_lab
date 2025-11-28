// --- 1. AUTENTICAÇÃO E UI ---
document.addEventListener('DOMContentLoaded', async () => {
    const usuarioId = localStorage.getItem('usuario_id');
    const usuarioTipo = localStorage.getItem('usuario_tipo');
    const usuarioNome = localStorage.getItem('usuario_nome');

    if (!usuarioId || usuarioTipo !== 'ADMIN') {
        alert("Acesso restrito.");
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name-display').innerText = usuarioNome;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioNome)}&background=0D6EFD&color=fff`;

    // Carrega as salas para o filtro
    carregarSalasNoFiltro();
});

// --- 2. CARREGAR SALAS ---
async function carregarSalasNoFiltro() {
    try {
        const res = await fetch('/api/sala/findAll');
        const json = await res.json();

        if (json.sucesso) {
            const select = document.getElementById('selectSala');
            // Limpa (mantendo a opção "Todas")
            select.innerHTML = '<option value="0">Todas as Salas</option>';

            json.data.forEach(sala => {
                const opt = document.createElement('option');
                opt.value = sala.id_sala;
                opt.innerText = sala.nome;
                select.appendChild(opt);
            });
        }
    } catch (error) {
        console.error("Erro ao buscar salas", error);
    }
}

// --- 3. AÇÃO DE GERAR PDF ---
function gerarRelatorio() {
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;
    const idSala = document.getElementById("selectSala").value;
    const nomeUsuario = document.getElementById("nomeUsuario").value;

    const params = new URLSearchParams({
        dataInicio,
        dataFim,
        idSala,
        nomeUsuario
    });

    // Abre em nova aba
    const url = `/api/relatorio/gerar?${params.toString()}`;
    window.open(url, '_blank');
}

// --- 4. MENU MOBILE ---
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