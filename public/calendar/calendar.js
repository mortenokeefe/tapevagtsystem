    document.addEventListener('DOMContentLoaded', function() {
        var calendarEl = document.getElementById('calendar');

        var calendar = new FullCalendar.Calendar(calendarEl, {
            plugins: [ 'dayGrid', 'interaction' ],
            dateClick: function(info) {
                calendar.changeView('dayGridDay', info.date)
            },
            events: {url: "http://localhost:8080/calendar/api/event"},
            eventClick: function(){
            },
            eventRender: function(info){
                info.el.append( info.event.extendedProps.description + "      Ledige vagter: " + info.event.extendedProps.antalLedigeVagter);
                if(info.event.extendedProps.antalLedigeVagter < 2){
                    info.el.style.backgroundColor = 'red'
                    info.el.style.borderColor = 'red'
                }
            }


        });
        calendar.render();
    });
