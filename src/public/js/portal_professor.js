const API_BASE = 'http://localhost:3000/api';
        
        // Mapas auxiliares (Preenchidos via API)
        let mapaSalas = {};
        let mapaTurnos = {};

        // 1. Inicialização e Auth
        document.addEventListener('DOMContentLoaded', async () => {
            const usuarioNome = localStorage.getItem('usuario_nome');
            const usuarioTipo = localStorage.getItem('usuario_tipo');
            const usuarioId = localStorage.getItem('usuario_id');

            if (!usuarioId) {
                window.location.href = 'index.html';
                return;
            }

            // Preenche Header
            document.getElementById('user-name-display').innerText = usuarioNome;
            document.getElementById('user-type-display').innerText = usuarioTipo;
            document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioNome)}&background=0D6EFD&color=fff`;
            
            if (usuarioTipo === 'ADMIN') document.getElementById('menu-admin').style.display = 'block';

            // Carrega Dados Reais
            await carregarDashboard(usuarioId);
        });

        // 2. Lógica Principal do Dashboard
        async function carregarDashboard(idUsuario) {
            try {
                // Buscamos tudo em paralelo para ser rápido
                const [resSalas, resHorarios, resReservas] = await Promise.all([
                    fetch(`${API_BASE}/sala/findAll`),
                    fetch(`${API_BASE}/horario/findAll`),
                    fetch(`${API_BASE}/reserva/findAll`) // Pegamos tudo para filtrar no JS
                ]);

                const jsonSalas = await resSalas.json();
                const jsonHorarios = await resHorarios.json();
                const jsonReservas = await resReservas.json();

                // 2.1 Mapear IDs para Nomes (Ex: ID 1 -> "Lab 01")
                if(jsonSalas.sucesso) {
                    jsonSalas.data.forEach(s => mapaSalas[s.id_sala] = s.nome);
                }
                if(jsonHorarios.sucesso) {
                    jsonHorarios.data.forEach(h => mapaTurnos[h.id_horario] = `${h.turno} (${h.hora_inicio.slice(0,5)}-${h.hora_fim.slice(0,5)})`);
                }

                // 2.2 Filtrar reservas DO USUÁRIO
                const todasReservas = jsonReservas.data || [];
                const minhasReservas = todasReservas.filter(r => r.fk_usuario == idUsuario);

                // --- LOGICA DOS CARDS ---
                
                // Data de hoje (sem hora para comparação)
                const hoje = new Date();
                hoje.setHours(0,0,0,0);
                
                // Filtra Futuras/Ativas
                const reservasFuturas = minhasReservas.filter(r => {
                    const dataReserva = new Date(r.data_reserva); // Converte string do banco para Date
                    // Ajusta fuso se necessário, mas para comparação simples >= hoje funciona
                    return dataReserva >= hoje && r.status !== 'CANCELADA';
                });

                // Ordena por data (a mais próxima primeiro)
                reservasFuturas.sort((a, b) => new Date(a.data_reserva) - new Date(b.data_reserva));

                // A. Preencher Card "Próxima Reserva"
                const divProx = document.getElementById('card-prox-reserva');
                if (reservasFuturas.length > 0) {
                    const prox = reservasFuturas[0];
                    const nomeSala = mapaSalas[prox.fk_sala] || "Sala Desconhecida";
                    const dataFormatada = new Date(prox.data_reserva).toLocaleDateString('pt-BR');
                    
                    divProx.innerHTML = `
                        <h3 class="fw-bold text-dark mb-0">${nomeSala}</h3>
                        <small class="text-primary fw-bold">${dataFormatada}</small>
                    `;
                } else {
                    divProx.innerHTML = `<h5 class="text-muted">Nenhuma reserva futura.</h5>`;
                }

                // B. Preencher Card "Total Ativas"
                document.getElementById('card-total-ativas').innerText = reservasFuturas.length > 0 ? `${reservasFuturas.length} Agendamentos` : "0 Agendamentos";

                // --- LÓGICA DA TABELA (CRIADAS HOJE) ---
                
                // Filtra onde data_criacao == hoje
                const criadasHoje = minhasReservas.filter(r => {
                    if(!r.data_criacao) return false;
                    const dtCriacao = new Date(r.data_criacao);
                    return dtCriacao.toDateString() === new Date().toDateString();
                });

                // Ordena as mais recentes primeiro
                criadasHoje.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));

                const tbody = document.getElementById('tabela-historico');
                tbody.innerHTML = ""; // Limpa carregando

                if (criadasHoje.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Você não fez nenhuma reserva hoje.</td></tr>`;
                } else {
                    criadasHoje.forEach(r => {
                        const nomeSala = mapaSalas[r.fk_sala] || `Sala ID ${r.fk_sala}`;
                        const nomeTurno = mapaTurnos[r.fk_horario] || `Turno ID ${r.fk_horario}`;
                        // Data da reserva (quando vai acontecer)
                        const dataReservaFmt = new Date(r.data_reserva).toLocaleDateString('pt-BR', {timeZone: 'UTC'});

                        // Badge de Status
                        let badgeClass = 'bg-secondary';
                        if(r.status === 'CONFIRMADA') badgeClass = 'bg-success';
                        if(r.status === 'CANCELADA') badgeClass = 'bg-danger';

                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${nomeSala}</td>
                            <td>${dataReservaFmt}</td>
                            <td>${nomeTurno}</td>
                            <td><span class="badge ${badgeClass}">${r.status}</span></td>
                        `;
                        tbody.appendChild(tr);
                    });
                }

            } catch (erro) {
                console.error(erro);
                document.getElementById('tabela-historico').innerHTML = `<tr><td colspan="4" class="text-danger text-center">Erro ao carregar dados. Verifique se o servidor está rodando.</td></tr>`;
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