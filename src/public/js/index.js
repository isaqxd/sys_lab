const API_BASE = 'http://localhost:3000/api';

document.getElementById('formLogin').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const msgErro = document.getElementById('msg-erro');
    const btn = document.getElementById('btn-entrar');

    // Reset visual
    msgErro.style.display = 'none';
    btn.disabled = true;
    btn.innerText = "Verificando...";

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const resultado = await response.json();

        if (response.ok) {
            // --- O PULO DO GATO ---
            // Salvamos os dados do usuário no navegador
            localStorage.setItem('usuario_id', resultado.data.id);
            localStorage.setItem('usuario_nome', resultado.data.nome);
            localStorage.setItem('usuario_tipo', resultado.data.tipo);

            // Redireciona baseado no tipo (opcional, ou joga direto pra reserva)
            if (resultado.data.tipo === 'ADMIN') {
                // window.location.href = '/admin-dashboard.html'; (Se você fizer essa tela depois)
                window.location.href = '/adm-gerenciar-usuario.html';
            } else {
                window.location.href = '/prof-portal.html'; // Nome do seu arquivo de reserva
            }

        } else {
            msgErro.innerText = resultado.erro || "Falha no login";
            msgErro.style.display = 'block';
        }

    } catch (error) {
        console.error(error);
        msgErro.innerText = "Erro de conexão com o servidor.";
        msgErro.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerText = "ENTRAR";
    }
});