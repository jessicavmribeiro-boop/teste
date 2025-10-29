// config.js - COM SUAS URLs REAIS
const API_BASE = "/api"; // 👈 este é o proxy configurado no Netlify

const CONFIG = {
    BACKEND_URLS: {
        cadastrarCliente: `${API_BASE}/cadastrar-cliente`,
        solicitarAgendamento: `${API_BASE}/solicitar-agendamento`,

        // Estes continuam simulados por enquanto
        listarServicos: "simular",
        listarHorarios: "simular",
        listarAgendamentos: "simular",
        buscarCliente: "simular"
    },
    ADMIN_PASSWORD: "nathalia123"
};

const DEFAULT_SERVICES = [
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
