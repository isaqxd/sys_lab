const API_BASE = 'http://localhost:3000/api';

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
        mostrarMensagem('Acesso negado. Apenas administradores podem cadastrar usuários.', 'danger');
        setTimeout(() => {
            window.location.href = 'portal_professor.html';
        }, 2000);
        return;
    }

    // Preenche Header
    document.getElementById('user-name-display').innerText = usuarioNome;
    document.getElementById('user-type-display').innerText = usuarioTipo;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioNome)}&background=0D6EFD&color=fff`;

    // Configurar o formulário
    configurarFormulario();
});

function configurarFormulario() {
    document.getElementById('formCad').addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const nome = formData.get('nome');
        const email = formData.get('email');
        const senha = formData.get('senha');
        const tipo = formData.get('tipo');

        // Validação básica
        if (senha.length < 6) {
            mostrarMensagem('A senha deve ter pelo menos 6 caracteres.', 'warning');
            return;
        }

        const cadData = {
            nome: nome,
            email: email,
            senha: senha,
            tipo: tipo
        };

        try {
            const response = await fetch(`${API_BASE}/usuario/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cadData)
            });

            const result = await response.json();

            if (response.ok && result.sucesso) {
                mostrarMensagem('Usuário cadastrado com sucesso!', 'success');
                this.reset();
                // Volta para o tipo padrão (PROFESSOR)
                document.getElementById('tipo').value = 'PROFESSOR';
            } else {
                const errMsg = result.erro || result.message || 'Erro desconhecido ao cadastrar usuário';
                mostrarMensagem(`Erro: ${errMsg}`, 'danger');
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarMensagem('Erro ao cadastrar usuário. Verifique o console para mais detalhes.', 'danger');
        }
    });
}

function mostrarMensagem(texto, tipo = 'info') {
    const messageDiv = document.getElementById('message');
    const messageText = document.getElementById('message-text');

    messageText.innerText = texto;
    messageDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    messageDiv.style.display = 'block';

    // Auto-esconder após 5 segundos para mensagens de sucesso/info
    if (tipo === 'success' || tipo === 'info') {
        setTimeout(() => {
            fecharMensagem();
        }, 5000);
    }
}

function fecharMensagem() {
    document.getElementById('message').style.display = 'none';
}

// Lógica do menu mobile
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