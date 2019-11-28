document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('dayCalendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [ 'dayGrid' ],
        defaultView: 'dayGridDay',
        defaultDate: document.URL.toString().substr(document.URL.toString().length - 10)
    });

    calendar.render()
});