// api.js - VERSÃO SIMPLIFICADA SEM PROXY
class ApiService {
    static async request(action, data = {}) {
        console.log('🔵 Enviando para:', action, data);
        
        // Se for "simular", usa dados locais
        if (CONFIG.BACKEND_URLS[action] === 'simular') {
            console.log('⚪ Simulando resposta para:', action);
            return await this.simularResposta(action, data);
        }
        
        // Se tem URL real, tenta fazer requisição DIRETA
        try {
            const url = CONFIG.BACKEND_URLS[action];
            console.log('🌐 Tentando requisição direta para:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Resposta real recebida:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Erro na requisição direta:', error);
            console.log('🔄 Usando modo simulação devido ao erro CORS');
            return await this.simularResposta(action, data);
        }
    }

    // Simula respostas para ações não configuradas
    static async simularResposta(action, data) {
        // Delay para parecer real
        await new Promise(resolve => setTimeout(resolve, 800));
        
        switch(action) {
            case 'listarServicos':
                return { 
                    success: true, 
                    servicos: DEFAULT_SERVICES,
                    message: '📦 Serviços carregados (modo simulação)'
                };
                
            case 'listarHorarios':
                return { 
                    success: true, 
                    horarios: this.gerarHorariosTeste(),
                    message: '⏰ Horários carregados (modo simulação)'
                };
                
            case 'buscarCliente':
                return { 
                    success: true, 
                    cliente: null,
                    message: '👤 Cliente não encontrado (modo simulação)'
                };
                
            case 'listarAgendamentos':
                return { 
                    success: true, 
                    agendamentos: [],
                    message: '📋 Nenhum agendamento (modo simulação)'
                };
                
            case 'cadastrarCliente':
                return { 
                    success: true, 
                    cliente: data.cliente,
                    message: '✅ Cliente cadastrado (modo simulação)'
                };
                
            case 'solicitarAgendamento':
                return { 
                    success: true, 
                    agendamento: data.agendamento,
                    message: '📅 Agendamento solicitado (modo simulação)'
                };
                
            default:
                return { 
                    success: true, 
                    message: `Ação ${action} simulada com sucesso` 
                };
        }
    }

    // Gera horários de teste
    static gerarHorariosTeste() {
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

    // Métodos específicos
    static async cadastrarCliente(cliente) {
        console.log('📝 Cadastrando cliente:', cliente);
        return await this.request('cadastrarCliente', { cliente });
    }

    static async buscarCliente(telefone) {
        return await this.request('buscarCliente', { telefone });
    }

    static async solicitarAgendamento(agendamento) {
        console.log('📅 Solicitando agendamento:', agendamento);
        return await this.request('solicitarAgendamento', { agendamento });
    }

    static async listarServicos() {
        return await this.request('listarServicos');
    }

    static async listarHorarios() {
        return await this.request('listarHorarios');
    }

    static async listarAgendamentos() {
        return await this.request('listarAgendamentos');
    }
}

// Funções auxiliares
function formatarTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 10) {
        valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    input.value = valor;
}

function formatarData(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}