// Configurações
const CONFIG = {
  spreadsheetId: '1fK0r21m61sHjqf0mOf6rAwOz1nTDIVs9HRw9nqHEz7Y', 
  sheetNames: {
    clientes: 'Clientes',
    agendamentos: 'Agendamentos'
  },
  calendarId: 'agendanathaloy@gmail.com'
};

// Função principal que recebe as requisições
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const acao = data.acao;
    const dados = data.dados;
    
    let resultado;
    
    switch(acao) {
      case 'listarServicos':
        resultado = listarServicos();
        break;
      case 'listarHorarios':
        resultado = listarHorarios();
        break;
      case 'listarAgendamentos':
        resultado = listarAgendamentos();
        break;
      case 'listarClientes':
        resultado = listarClientes();
        break;
      case 'buscarCliente':
        resultado = buscarCliente(dados.telefone);
        break;
      case 'cadastrarCliente':
        resultado = cadastrarCliente(dados.cliente);
        break;
      case 'solicitarAgendamento':
        resultado = solicitarAgendamento(dados.agendamento);
        break;
      case 'confirmarAgendamento':
        resultado = confirmarAgendamento(dados.id);
        break;
      case 'recusarAgendamento':
        resultado = recusarAgendamento(dados.id);
        break;
      default:
        throw new Error('Ação não reconhecida: ' + acao);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, ...resultado }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Erro:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Função para compatibilidade com GET (opcional)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'API Nathalia Eloy Online' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================= FUNÇÕES DA PLANILHA =================

function getSheetByName(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  return spreadsheet.getSheetByName(sheetName);
}

function listarServicos() {
  // Serviços fixos - você pode migrar para planilha se quiser
  const servicos = [
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
  
  return { servicos: servicos };
}

function listarHorarios() {
  // Por enquanto, retornar horários fixos
  // Você pode implementar a lógica para buscar da planilha
  const horarios = {
    '2025-10-15': [
      { start: '09:00', end: '09:30', available: true, id: 'slot1' },
      { start: '10:30', end: '11:00', available: true, id: 'slot2' },
      { start: '14:00', end: '14:30', available: true, id: 'slot3' }
    ]
  };
  
  return { horarios: horarios };
}

function listarAgendamentos() {
  try {
    const sheet = getSheetByName(CONFIG.sheetNames.agendamentos);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const agendamentos = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // Se tem ID_Agendamento
        const agendamento = {
          id: row[0],
          idCliente: row[1],
          date: formatDateForJS(row[2]),
          hora: row[3],
          servicos: row[4],
          precoTotal: row[5],
          status: row[6],
          dataSolicitacao: row[7],
          eventoId: row[8]
        };
        agendamentos.push(agendamento);
      }
    }
    
    return { agendamentos: agendamentos };
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return { agendamentos: [] };
  }
}

function listarClientes() {
  try {
    const sheet = getSheetByName(CONFIG.sheetNames.clientes);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const clientes = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // Se tem ID_Cliente
        const cliente = {
          id: row[0],
          nome: row[1],
          sobrenome: row[2],
          nomeCompleto: row[3],
          whatsapp: row[4],
          email: row[5],
          aniversario: row[6] ? formatDateForJS(row[6]) : null,
          dataCadastro: row[7],
          totalAgendamentos: row[8] || 0
        };
        clientes.push(cliente);
      }
    }
    
    return { clientes: clientes };
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return { clientes: [] };
  }
}

function buscarCliente(telefone) {
  try {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    const sheet = getSheetByName(CONFIG.sheetNames.clientes);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const whatsappPlanilha = row[4] ? row[4].toString().replace(/\D/g, '') : '';
      
      if (whatsappPlanilha === telefoneLimpo) {
        return {
          cliente: {
            id: row[0],
            nome: row[1],
            sobrenome: row[2],
            nomeCompleto: row[3],
            whatsapp: row[4],
            email: row[5],
            aniversario: row[6] ? formatDateForJS(row[6]) : null,
            dataCadastro: row[7],
            totalAgendamentos: row[8] || 0
          }
        };
      }
    }
    
    return { cliente: null };
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return { cliente: null };
  }
}

function cadastrarCliente(cliente) {
  try {
    const sheet = getSheetByName(CONFIG.sheetNames.clientes);
    const id = generateId();
    const dataCadastro = new Date().toISOString().split('T')[0];
    
    const newRow = [
      id,
      cliente.nome,
      cliente.sobrenome,
      cliente.nome + ' ' + cliente.sobrenome,
      cliente.whatsapp,
      cliente.email || '',
      cliente.aniversario || '',
      dataCadastro,
      0 // Total_Agendamentos inicia em 0
    ];
    
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      cliente: { ...cliente, id: id, dataCadastro: dataCadastro } 
    };
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    throw new Error('Erro ao cadastrar cliente: ' + error.message);
  }
}

function solicitarAgendamento(agendamento) {
  try {
    const sheet = getSheetByName(CONFIG.sheetNames.agendamentos);
    const id = generateId();
    const dataSolicitacao = new Date().toISOString();
    
    // Buscar ID do cliente pelo WhatsApp
    const clienteResult = buscarCliente(agendamento.clientPhone);
    const idCliente = clienteResult.cliente ? clienteResult.cliente.id : '';
    
    const newRow = [
      id,
      idCliente,
      agendamento.date,
      agendamento.startTime,
      agendamento.service,
      agendamento.price,
      'solicitado',
      dataSolicitacao,
      '' // Evento_ID (vazio até ser confirmado)
    ];
    
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      agendamento: { ...agendamento, id: id, dataSolicitacao: dataSolicitacao } 
    };
  } catch (error) {
    console.error('Erro ao solicitar agendamento:', error);
    throw new Error('Erro ao solicitar agendamento: ' + error.message);
  }
}

function confirmarAgendamento(idAgendamento) {
  try {
    const sheet = getSheetByName(CONFIG.sheetNames.agendamentos);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const idIndex = headers.indexOf('ID_Agendamento');
    const statusIndex = headers.indexOf('Status');
    const eventoIdIndex = headers.indexOf('Evento_ID');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] === idAgendamento) {
        // Atualizar status para confirmado
        sheet.getRange(i + 1, statusIndex + 1).setValue('confirmado');
        
        // Se tiver calendarId configurado, criar evento no Google Calendar
        if (CONFIG.calendarId) {
          const eventoId = criarEventoCalendar(data[i]);
          if (eventoId) {
            sheet.getRange(i + 1, eventoIdIndex + 1).setValue(eventoId);
          }
        }
        
        // Atualizar total de agendamentos do cliente
        const idCliente = data[i][headers.indexOf('ID_Cliente')];
        if (idCliente) {
          atualizarTotalAgendamentosCliente(idCliente);
        }
        
        return { success: true };
      }
    }
    
    throw new Error('Agendamento não encontrado');
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error);
    throw new Error('Erro ao confirmar agendamento: ' + error.message);
  }
}

function recusarAgendamento(idAgendamento) {
  try {
    const sheet = getSheetByName(CONFIG.sheetNames.agendamentos);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const idIndex = headers.indexOf('ID_Agendamento');
    const statusIndex = headers.indexOf('Status');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] === idAgendamento) {
        sheet.getRange(i + 1, statusIndex + 1).setValue('recusado');
        return { success: true };
      }
    }
    
    throw new Error('Agendamento não encontrado');
  } catch (error) {
    console.error('Erro ao recusar agendamento:', error);
    throw new Error('Erro ao recusar agendamento: ' + error.message);
  }
}

// ================= FUNÇÕES AUXILIARES =================

function generateId() {
  return Utilities.getUuid();
}

function formatDateForJS(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

function atualizarTotalAgendamentosCliente(idCliente) {
  try {
    const sheetClientes = getSheetByName(CONFIG.sheetNames.clientes);
    const sheetAgendamentos = getSheetByName(CONFIG.sheetNames.agendamentos);
    
    const dataClientes = sheetClientes.getDataRange().getValues();
    const dataAgendamentos = sheetAgendamentos.getDataRange().getValues();
    
    const headersClientes = dataClientes[0];
    const headersAgendamentos = dataAgendamentos[0];
    
    const idClienteIndex = headersClientes.indexOf('ID_Cliente');
    const totalIndex = headersClientes.indexOf('Total_Agendamentos');
    const idClienteAgendamentoIndex = headersAgendamentos.indexOf('ID_Cliente');
    const statusIndex = headersAgendamentos.indexOf('Status');
    
    // Contar agendamentos confirmados do cliente
    let totalConfirmados = 0;
    for (let i = 1; i < dataAgendamentos.length; i++) {
      if (dataAgendamentos[i][idClienteAgendamentoIndex] === idCliente && 
          dataAgendamentos[i][statusIndex] === 'confirmado') {
        totalConfirmados++;
      }
    }
    
    // Atualizar na planilha de clientes
    for (let i = 1; i < dataClientes.length; i++) {
      if (dataClientes[i][idClienteIndex] === idCliente) {
        sheetClientes.getRange(i + 1, totalIndex + 1).setValue(totalConfirmados);
        break;
      }
    }
    
  } catch (error) {
    console.error('Erro ao atualizar total de agendamentos:', error);
  }
}

function criarEventoCalendar(dadosAgendamento) {
  try {
    if (!CONFIG.calendarId) return null;
    
    const calendar = CalendarApp.getCalendarById(CONFIG.calendarId);
    if (!calendar) {
      console.error('Calendar não encontrado:', CONFIG.calendarId);
      return null;
    }
    
    const startTime = new Date(dadosAgendamento[2] + 'T' + dadosAgendamento[3]);
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // 1 hora depois
    
    const evento = calendar.createEvent(
      `Agendamento - ${dadosAgendamento[4]}`, // Título com serviço
      startTime,
      endTime,
      {
        description: `Cliente: ${dadosAgendamento[1]}\nServiço: ${dadosAgendamento[4]}\nValor: R$ ${dadosAgendamento[5]}`,
        guests: '' // Adicione emails se quiser convidar
      }
    );
    
    return evento.getId();
  } catch (error) {
    console.error('Erro ao criar evento no calendar:', error);
    return null;
  }
}