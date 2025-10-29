// ================= CALENDÁRIO =================
function inicializarCalendario() {
    const calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) {
        console.error('Elemento do calendário não encontrado');
        return;
    }
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
        },
        events: generateCalendarEvents(),
        dateClick: function(info) {
            handleDateClick(info);
        },
        eventClick: function(info) {
            handleEventClick(info);
        },
        eventDisplay: 'block'
    });
    
    calendar.render();
    console.log('Calendário inicializado com sucesso');
}

function generateCalendarEvents() {
    const events = [];
    
    // Horários disponíveis (verde)
    for (const date in availableSlots) {
        availableSlots[date].forEach(slot => {
            if (slot.available && !isSlotSolicitado(date, slot.id) && !isSlotConfirmado(date, slot.id)) {
                events.push({
                    title: 'Disponível',
                    start: `${date}T${slot.start}`,
                    end: `${date}T${slot.end}`,
                    color: '#28a745',
                    extendedProps: {
                        date: date,
                        startTime: slot.start,
                        endTime: slot.end,
                        slotId: slot.id,
                        status: 'disponivel'
                    }
                });
            }
        });
    }
    
    return events;
}

function handleDateClick(info) {
    const dateStr = info.dateStr;
    if (availableSlots[dateStr]) {
        calendar.changeView('timeGridDay', dateStr);
    } else {
        alert('Não há horários disponíveis para esta data.');
    }
}

function handleEventClick(info) {
    const event = info.event;
    const status = event.extendedProps.status;
    
    if (status === 'disponivel') {
        selectedDate = event.extendedProps.date;
        selectedTime = `${event.extendedProps.startTime} - ${event.extendedProps.endTime}`;
        selectedSlotId = event.extendedProps.slotId;
        
        updateBookingSummary();
        
        if (window.innerWidth < 768) {
            document.querySelector('.booking-summary').scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        alert('Este horário não está mais disponível.');
    }
}

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