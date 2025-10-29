// ================= FUNÇÕES DO PAINEL ADMIN QUE ESTAVAM FALTANDO =================
// ================= VERIFICAÇÃO DE CARREGAMENTO =================
console.log('admin.js carregado com sucesso');

// ================= SISTEMA DE LOGIN =================
function openLoginModal() {
    console.log('Abrindo modal de login');
    const modal = document.getElementById('login-modal');
    if (!modal) {
        console.error('Modal de login não encontrado');
        return;
    }
    modal.style.display = 'flex';
    document.getElementById('admin-password').focus();
}

function closeLoginModal() {
    console.log('Fechando modal de login');
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('admin-password').value = '';
    document.getElementById('login-error').style.display = 'none';
}

function checkPassword() {
    console.log('Verificando senha');
    const password = document.getElementById('admin-password').value;
    
    if (password === CONFIG.ADMIN_PASSWORD) {
        closeLoginModal();
        openAdminPanel();
    } else {
        document.getElementById('login-error').style.display = 'block';
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
    }
}

function logout() {
    console.log('Fazendo logout');
    closeAdminPanel();
}

function closeAdminPanel() {
    console.log('Fechando painel admin');
    document.getElementById('admin-panel').style.display = 'none';
}

// ================= FUNÇÕES DO PAINEL ADMIN =================
async function openAdminPanel() {   
    console.log('Abrindo painel admin');
    document.getElementById('admin-panel').style.display = 'flex';
    await loadSolicitacoes();
    loadServicos();
    loadHorariosCadastrados();
    carregarEstatisticas();
    carregarAniversariantes();
    carregarAgendaMensal();
}

function openTab(tabName) {
    console.log('Abrindo aba:', tabName);
    
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover active de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    const tabElement = document.getElementById(`tab-${tabName}`);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Ativar botão da aba
    const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (tabButton) {
        tabButton.classList.add('active');
    }
}

// ================= CARREGAR CONTEÚDO DAS ABAS =================
function loadTabContent(tabName) {
    const container = document.getElementById('tab-content');
    if (!container) return;

    switch(tabName) {
        case 'solicitacoes':
            container.innerHTML = `
                <div id="tab-solicitacoes" class="tab-content active">
                    <h3>📋 Solicitações de Agendamento</h3>
                    <div class="solicitacoes-grid">
                        <div>
                            <h4>⏳ Pendentes (<span id="count-pendentes">0</span>)</h4>
                            <div id="solicitacoes-pendentes" style="max-height: 400px; overflow-y: auto;"></div>
                        </div>
                        <div>
                            <h4>✅ Confirmados (<span id="count-confirmados">0</span>)</h4>
                            <div id="solicitacoes-confirmadas" style="max-height: 400px; overflow-y: auto;"></div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'agenda':
            container.innerHTML = `
                <div id="tab-agenda" class="tab-content">
                    <h3>📅 Minha Agenda</h3>
                    <div class="agenda-mes-selector">
                        <label for="mes-agenda">Selecione o mês:</label>
                        <input type="month" id="mes-agenda" class="form-input">
                    </div>
                    <div id="lista-agenda-mensal" style="max-height: 500px; overflow-y: auto;"></div>
                </div>
            `;
            break;
            
        case 'horarios':
            container.innerHTML = `
                <div id="tab-horarios" class="tab-content">
                    <h3>⏰ Gerenciar Horários Disponíveis</h3>
                    <div class="horarios-grid">
                        <!-- Conteúdo dos horários -->
                        <div id="horarios-form"></div>
                        <div id="horarios-lista"></div>
                    </div>
                </div>
            `;
            break;
            
        // Adicione outras abas conforme necessário
        default:
            container.innerHTML = `<div class="tab-content active"><h3>${tabName} - Em desenvolvimento</h3></div>`;
    }
    
    // Após carregar o conteúdo, carregue os dados específicos da aba
    setTimeout(() => {
        switch(tabName) {
            case 'solicitacoes':
                loadSolicitacoes();
                break;
            case 'agenda':
                carregarAgendaMensal();
                break;
            case 'horarios':
                loadHorariosCadastrados();
                break;
            case 'servicos':
                loadServicos();
                break;
            case 'aniversariantes':
                carregarAniversariantes();
                break;
        }
    }, 100);
}

// ================= EVENT LISTENERS DO ADMIN =================
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para as abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            openTab(tabName);
            loadTabContent(tabName);
        });
    });
    
    // Event listeners para botões do admin
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', logout);
    }
    
    const btnCloseAdmin = document.getElementById('btn-close-admin');
    if (btnCloseAdmin) {
        btnCloseAdmin.addEventListener('click', closeAdminPanel);
    }
    
    // Event listener para o botão flutuante
    const adminFloatBtn = document.getElementById('admin-float-btn');
    if (adminFloatBtn) {
        adminFloatBtn.addEventListener('click', openLoginModal);
    }
});

// ... (mantenha as outras funções do admin que você já tem)
function loadServicos() {
    const container = document.getElementById('lista-servicos');
    if (!container) return;
    
    container.innerHTML = '';

    if (servicos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhum serviço cadastrado</p>';
        return;
    }

    servicos.forEach((servico, index) => {
        const item = document.createElement('div');
        item.className = 'servico-item';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0;">${servico.nome}</h4>
                    <p style="margin: 2px 0; font-size: 14px; color: #666;">${servico.descricao || 'Sem descrição'}</p>
                    <p style="margin: 2px 0; font-size: 14px;"><strong>Preço:</strong> R$ ${servico.preco.toFixed(2).replace('.', ',')}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <button onclick="editarServico(${index})" style="background: #17a2b8; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                        ✏️ Editar
                    </button>
                    <button onclick="removerServico(${index})" style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                        🗑️ Remover
                    </button>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function loadHorariosCadastrados() {
    const container = document.getElementById('lista-horarios-cadastrados');
    if (!container) return;
    
    container.innerHTML = '';

    const datas = Object.keys(availableSlots).sort();
    
    if (datas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhum horário cadastrado</p>';
        return;
    }

    datas.forEach(data => {
        const dataItem = document.createElement('div');
        dataItem.className = 'horario-item';
        dataItem.innerHTML = `<h5 style="margin: 0 0 10px 0;">${formatarData(data)}</h5>`;
        
        const horariosContainer = document.createElement('div');
        horariosContainer.style.display = 'flex';
        horariosContainer.style.flexWrap = 'wrap';
        horariosContainer.style.gap = '8px';

        availableSlots[data].forEach((horario, index) => {
            const horarioElement = document.createElement('div');
            horarioElement.style.background = '#e8f5e8';
            horarioElement.style.padding = '6px 10px';
            horarioElement.style.borderRadius = '4px';
            horarioElement.style.fontSize = '12px';
            horarioElement.style.display = 'flex';
            horarioElement.style.alignItems = 'center';
            horarioElement.style.gap = '5px';

            horarioElement.innerHTML = `
                ${horario.start} - ${horario.end}
                <button onclick="removerHorario('${data}', ${index})" style="background: #dc3545; color: white; border: none; border-radius: 3px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px;">
                    ×
                </button>
            `;

            horariosContainer.appendChild(horarioElement);
        });

        dataItem.appendChild(horariosContainer);
        container.appendChild(dataItem);
    });
}

function carregarEstatisticas() {
    const totalAgendamentos = agendamentosConfirmados.length;
    const agendamentosEsteMes = agendamentosConfirmados.filter(ag => {
        const dataAgendamento = new Date(ag.date);
        const agora = new Date();
        return dataAgendamento.getMonth() === agora.getMonth() && 
               dataAgendamento.getFullYear() === agora.getFullYear();
    }).length;

    const faturamento = agendamentosConfirmados.reduce((total, ag) => total + (ag.price || 0), 0);

    document.getElementById('stats-total').textContent = totalAgendamentos;
    document.getElementById('stats-mes').textContent = agendamentosEsteMes;
    document.getElementById('stats-faturamento').textContent = `R$ ${faturamento.toFixed(2).replace('.', ',')}`;
}

function carregarAniversariantes() {
    const container = document.getElementById('lista-aniversariantes');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Filtrar clientes que fazem aniversário este mês
    const mesAtual = new Date().getMonth() + 1;
    const aniversariantes = clientesCadastrados.filter(cliente => {
        if (!cliente.aniversario) return false;
        const mesAniversario = new Date(cliente.aniversario).getMonth() + 1;
        return mesAniversario === mesAtual;
    });
    
    // Ordenar por dia do aniversário
    aniversariantes.sort((a, b) => {
        const diaA = new Date(a.aniversario).getDate();
        const diaB = new Date(b.aniversario).getDate();
        return diaA - diaB;
    });
    
    if (aniversariantes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhum aniversariante este mês.</p>';
        return;
    }
    
    aniversariantes.forEach(cliente => {
        const dataAniversario = new Date(cliente.aniversario);
        const dia = dataAniversario.getDate();
        const mes = dataAniversario.toLocaleDateString('pt-BR', { month: 'long' });
        
        const item = document.createElement('div');
        item.className = 'aniversariante-item';
        item.innerHTML = `
            <div class="aniversariante-info">
                <h4>${cliente.nomeCompleto}</h4>
                <p>📞 ${cliente.telefone}</p>
            </div>
            <div class="aniversariante-data">
                ${dia} de ${mes}
            </div>
        `;
        container.appendChild(item);
    });
}

function carregarAgendaMensal() {
    const mesSelecionado = document.getElementById('mes-agenda').value;
    const container = document.getElementById('lista-agenda-mensal');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!mesSelecionado) {
        const hoje = new Date();
        const mesAtual = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');
        document.getElementById('mes-agenda').value = mesAtual;
        carregarAgendaMensal();
        return;
    }
    
    const [ano, mes] = mesSelecionado.split('-');
    
    // Combinar agendamentos solicitados e confirmados para a agenda
    const todosAgendamentos = [...agendamentosSolicitados, ...agendamentosConfirmados];
    
    // Filtrar agendamentos do mês selecionado
    const agendamentosDoMes = todosAgendamentos.filter(ag => {
        const [anoAg, mesAg] = ag.date.split('-');
        return anoAg === ano && mesAg === mes;
    });
    
    // Ordenar por data e horário
    agendamentosDoMes.sort((a, b) => {
        const dataA = new Date(`${a.date}T${a.startTime}`);
        const dataB = new Date(`${b.date}T${b.startTime}`);
        return dataA - dataB;
    });
    
    if (agendamentosDoMes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhum agendamento para este mês.</p>';
        return;
    }
    
    agendamentosDoMes.forEach(agendamento => {
        const item = document.createElement('div');
        item.className = 'agenda-item';
        item.innerHTML = `
            <div class="agenda-info">
                <h4>${agendamento.service}</h4>
                <p><strong>Cliente:</strong> ${agendamento.clientName}</p>
                <p><strong>WhatsApp:</strong> ${agendamento.clientPhone}</p>
                <p><strong>Data:</strong> ${formatarData(agendamento.date)}</p>
                <p><strong>Horário:</strong> ${agendamento.startTime} - ${agendamento.endTime}</p>
                <p><strong>Status:</strong> ${agendamento.status === 'confirmado' ? '✅ Confirmado' : '⏳ Pendente'}</p>
                <p><strong>Preço:</strong> R$ ${agendamento.price?.toFixed(2).replace('.', ',') || '0,00'}</p>
            </div>
            <div class="agenda-actions">
                <button class="btn-small btn-edit" onclick="editarAgendamento('${agendamento.id}')">Editar</button>
                <button class="btn-small btn-delete" onclick="excluirAgendamento('${agendamento.id}')">Excluir</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// Adicione também estas funções auxiliares do admin:

function editarAgendamento(id) {
    alert(`Editar agendamento ${id} - Funcionalidade em desenvolvimento`);
}

async function excluirAgendamento(id) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        // Implementar exclusão no backend
        alert('Exclusão em desenvolvimento');
    }
}

function removerHorario(data, index) {
    if (confirm('Tem certeza que deseja remover este horário?')) {
        availableSlots[data].splice(index, 1);
        
        if (availableSlots[data].length === 0) {
            delete availableSlots[data];
        }
        
        localStorage.setItem('availableSlots', JSON.stringify(availableSlots));
        calendar.refetchEvents();
        loadHorariosCadastrados();
    }
}