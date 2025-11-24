const API_BASE = 'http://localhost:3000/api';

document.getElementById('formCad').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const nome = formData.get('nome');
    const email = formData.get('email');
    const senha = formData.get('senha');

    const cadData = {
        nome: nome,
        email: email,
        senha: senha,
        tipo: 'PROFESSOR'
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
            showMessage('Usuário cadastrado com sucesso!', 'success');
            this.reset();
        } else {
            const errMsg = result.erro || result.message || 'Erro desconhecido ao cadastrar usuário';
            showMessage(`Erro: ${errMsg}`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao cadastrar usuário (ver console).', 'error');
    }
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="${type}">${message}</div>`;
    setTimeout(() => { messageDiv.innerHTML = ''; }, 5000);
}