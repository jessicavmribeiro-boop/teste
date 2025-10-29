// ================= CONFIGURAÇÃO INICIAL =================
let availableSlots = {};
let agendamentosSolicitados = [];
let agendamentosConfirmados = [];
let clientesCadastrados = [];
let servicos = [];

// Variáveis para controle
let selectedDate = null;
let selectedTime = null;
let selectedServices = [];
let selectedSlotId = null;
let calendar = null;

// ================= INICIALIZAÇÃO DO APP =================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando app com N8N...');
    initApp();
});

async function initApp() {
    await carregarDadosIniciais();
    inicializarCalendario();
    carregarServicosFrontend();
}

async function carregarDadosIniciais() {
    console.log('📦 Carregando dados iniciais...');
    try {
        // Carregar serviços
        const servicosResult = await ApiService.listarServicos();
        servicos = servicosResult.servicos || await getServicosPadrao();
        console.log('✅ Serviços carregados:', servicos.length);
        
        // Carregar horários
        const horariosResult = await ApiService.listarHorarios();
        availableSlots = horariosResult.horarios || getHorariosPadrao();
        console.log('✅ Horários carregados:', Object.keys(availableSlots).length);
        
        // Para teste, usar arrays vazios
        agendamentosSolicitados = [];
        agendamentosConfirmados = [];
        clientesCadastrados = [];
        
        console.log('🎉 Todos os dados carregados com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        // Usar dados padrão em caso de erro
        servicos = await getServicosPadrao();
        availableSlots = getHorariosPadrao();
        console.log('🔄 Usando dados padrão devido ao erro');
    }
}

function carregarServicosFrontend() {
    const serviceSelection = document.querySelector('.service-selection');
    if (!serviceSelection) return;
    
    serviceSelection.innerHTML = '<h3>Serviços Disponíveis</h3>';
    
    servicos.forEach(servico => {
        const serviceOption = document.createElement('div');
        serviceOption.className = 'service-option';
        serviceOption.onclick = function() { 
            toggleService(this, servico.nome, servico.preco);
        };
        serviceOption.innerHTML = `
            <div class="service-checkbox"></div>
            <div>
                <strong>${servico.nome}</strong>
                <p>R$ ${servico.preco.toFixed(2).replace('.', ',')}</p>
            </div>
        `;
        serviceSelection.appendChild(serviceOption);
    });
}

// ================= FUNÇÕES DO CLIENTE =================
function toggleService(element, service, price) {
    const checkbox = element.querySelector('.service-checkbox');
    const serviceIndex = selectedServices.findIndex(s => s.nome === service);
    
    if (serviceIndex === -1) {
        selectedServices.push({ nome: service, preco: price });
        checkbox.classList.add('checked');
        element.classList.add('selected');
    } else {
        selectedServices.splice(serviceIndex, 1);
        checkbox.classList.remove('checked');
        element.classList.remove('selected');
    }
    updateBookingSummary();
}

function updateBookingSummary() {
    const dateElement = document.getElementById('selected-date');
    const timeElement = document.getElementById('selected-time');
    const serviceElement = document.getElementById('selected-service');
    const priceElement = document.getElementById('selected-price');
    const bookBtn = document.getElementById('book-btn');
    const statusInfo = document.getElementById('status-info');
    
    if (selectedDate) {
        const [year, month, day] = selectedDate.split('-');
        dateElement.textContent = `Data: ${day}/${month}/${year}`;
    }
    
    if (selectedTime) {
        timeElement.textContent = `Horário: ${selectedTime}`;
    }
    
    if (selectedServices.length > 0) {
        const servicesList = selectedServices.map(s => s.nome).join(', ');
        const totalPrice = selectedServices.reduce((total, s) => total + s.preco, 0);
        
        serviceElement.textContent = `Serviços: ${servicesList}`;
        priceElement.textContent = `Preço Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    } else {
        serviceElement.textContent = `Serviços: Nenhum selecionado`;
        priceElement.textContent = `Preço Total: R$ 0,00`;
    }
    
    // Habilitar/desabilitar botão
    bookBtn.disabled = !(selectedDate && selectedTime && selectedServices.length > 0);
    bookBtn.textContent = '📨 Solicitar Agendamento';
    statusInfo.style.display = 'none';
}

// ================= FUNÇÕES DE MODAL =================
function openBookingModal() {
    const telefone = document.getElementById('client-phone').value;
    if (!telefone) {
        abrirModalCliente();
        return;
    }
    
    if (selectedDate && selectedTime && selectedServices.length > 0) {
        const [year, month, day] = selectedDate.split('-');
        document.getElementById('modal-date').textContent = `Data: ${day}/${month}/${year}`;
        document.getElementById('modal-time').textContent = `Horário: ${selectedTime}`;
        
        const servicesList = selectedServices.map(s => s.nome).join(', ');
        const totalPrice = selectedServices.reduce((total, s) => total + s.preco, 0);
        document.getElementById('modal-service').textContent = `Serviços: ${servicesList}`;
        document.getElementById('modal-price').textContent = `Preço Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
        
        document.getElementById('booking-modal').style.display = 'flex';
    } else {
        alert('Por favor, selecione uma data, horário e pelo menos um serviço.');
    }
}

function closeBookingModal() {
    document.getElementById('booking-modal').style.display = 'none';
}

// ================= SISTEMA DE CADASTRO =================
function formatarTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 10) {
        valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    input.value = valor;
}

function abrirModalCliente() {
    document.getElementById('cliente-modal').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('cliente-telefone').focus();
    }, 300);
}

function fecharModalCliente() {
    document.getElementById('cliente-modal').style.display = 'none';
}

async function confirmarCliente() {
    const telefone = document.getElementById('cliente-telefone').value;
    const nome = document.getElementById('cliente-nome').value;
    const sobrenome = document.getElementById('cliente-sobrenome').value;
    const aniversario = document.getElementById('cliente-aniversario').value;

    if (!telefone || !nome || !sobrenome) {
        alert('Por favor, preencha pelo menos nome, sobrenome e WhatsApp.');
        return;
    }

    const telefoneLimpo = telefone.replace(/\D/g, '');
    
    try {
        console.log('📝 Tentando cadastrar cliente...');
        
        const resultado = await ApiService.cadastrarCliente({
            nome: nome,
            sobrenome: sobrenome,
            whatsapp: telefoneLimpo,
            aniversario: aniversario,
            email: ''
        });
        
        console.log('✅ Resposta do cadastro:', resultado);
        
        if (resultado.success) {
            fecharModalCliente();
            abrirModalAgendamentoComCliente(telefoneLimpo, `${nome} ${sobrenome}`);
        } else {
            alert('Erro ao cadastrar: ' + (resultado.error || 'Tente novamente.'));
        }
        
    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        alert('Erro ao salvar cliente. Tente novamente.');
    }
}

function abrirModalAgendamentoComCliente(telefone, nomeCompleto) {
    document.getElementById('client-phone').value = telefone;
    document.getElementById('client-name').value = nomeCompleto;
    openBookingModal();
}

// ================= AGENDAMENTO =================
async function solicitarAgendamento() {
    const clientName = document.getElementById('client-name').value;
    const clientPhone = document.getElementById('client-phone').value;
    const clientEmail = document.getElementById('client-email').value;
    
    if (!clientName || !clientPhone) {
        alert('Por favor, preencha pelo menos seu nome e WhatsApp.');
        return;
    }

    const [startTime, endTime] = selectedTime.split(' - ');
    const totalPrice = selectedServices.reduce((total, s) => total + s.preco, 0);
    const servicesList = selectedServices.map(s => s.nome).join(', ');
    
    const novoAgendamento = {
        clientName: clientName,
        clientPhone: clientPhone,
        clientEmail: clientEmail,
        service: servicesList,
        price: totalPrice,
        date: selectedDate,
        startTime: startTime,
        endTime: endTime,
        slotId: selectedSlotId,
        status: 'solicitado'
    };

    try {
        console.log('📅 Enviando agendamento...', novoAgendamento);
        
        const resultado = await ApiService.solicitarAgendamento(novoAgendamento);
        console.log('✅ Resposta do agendamento:', resultado);
        
        if (resultado.success) {
            alert('✅ Solicitação enviada com sucesso!\n\nEntraremos em contato pelo WhatsApp para confirmar seu agendamento.');
            closeBookingModal();
            
            // Limpar seleções
            document.getElementById('client-name').value = '';
            document.getElementById('client-phone').value = '';
            document.getElementById('client-email').value = '';
            selectedServices = [];
            selectedDate = null;
            selectedTime = null;
            
            // Atualizar interface
            updateBookingSummary();
            document.querySelectorAll('.service-option').forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.service-checkbox').classList.remove('checked');
            });
            
        } else {
            alert('Erro ao enviar: ' + (resultado.error || 'Tente novamente.'));
        }
        
    } catch (error) {
        console.error('❌ Erro no agendamento:', error);
        alert('Erro ao enviar solicitação. Tente novamente.');
    }
}

// ================= DADOS PADRÃO =================
async function getServicosPadrao() {
    return [
        { nome: 'Aplicação Fibra de Vidro', preco: 130, descricao: 'Aplicação de fibra de vidro' },
        { nome: 'Aplicação Molde F1', preco: 130, descricao: 'Aplicação de molde F1' },
        { nome: 'Manutenção de Alongamento', preco: 120, descricao: 'Manutenção de alongamento' },
        { nome: 'Esmaltação em Gel', preco: 70, descricao: 'Esmaltação em gel' },
        { nome: 'Sistema Híbrido em Acrílico', preco: 70, descricao: 'Sistema híbrido em acrílico' },
        { nome: 'Detox das Unhas', preco: 10, descricao: 'Detox das unhas' },
        { nome: 'Manicure e Pedicure', preco: 50, descricao: 'Manicure e pedicure' },
        { nome: 'Manicure', preco: 25, descricao: 'Manicure' },
        { nome: 'Pedicure', preco: 30, descricao: 'Pedicure' },
        { nome: 'Massagem Reflexo Podal', preco: 100, descricao: 'Massagem reflexo podal' },
        { nome: 'Spa dos Pés', preco: 80, descricao: 'Spa dos pés' }
    ];
}

function getHorariosPadrao() {
    const horarios = {};
    const hoje = new Date();
    
    for (let i = 1; i <= 7; i++) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() + i);
        const dataStr = data.toISOString().split('T')[0];
        
        horarios[dataStr] = [
            { start: '09:00', end: '09:30', available: true, id: `slot_${i}_1` },
            { start: '10:30', end: '11:00', available: true, id: `slot_${i}_2` },
            { start: '14:00', end: '14:30', available: true, id: `slot_${i}_3` },
            { start: '16:00', end: '16:30', available: true, id: `slot_${i}_4` }
        ];
    }
    
    return horarios;
}

// ================= EVENT LISTENERS =================
document.addEventListener('DOMContentLoaded', function() {
    const bookBtn = document.getElementById('book-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', openBookingModal);
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    const clientPhone = document.getElementById('client-phone');
    if (clientPhone) {
        clientPhone.addEventListener('input', function() {
            formatarTelefone(this);
        });
    }
    
    const clienteTelefone = document.getElementById('cliente-telefone');
    if (clienteTelefone) {
        clienteTelefone.addEventListener('input', function() {
            formatarTelefone(this);
        });
    }
});

// ================= FUNÇÕES AUXILIARES =================
function isSlotSolicitado(date, slotId) {
    return agendamentosSolicitados.some(ag => 
        ag.date === date && ag.slotId === slotId
    );
}

function isSlotConfirmado(date, slotId) {
    return agendamentosConfirmados.some(ag => 
        ag.date === date && ag.slotId === slotId
    );
}

function formatarData(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}