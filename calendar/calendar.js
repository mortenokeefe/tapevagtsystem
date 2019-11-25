document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [ 'dayGrid', 'interaction' ],
        dateClick: dayPicked
    });



    calendar.render();
});
function dayPicked(info){
    var pickedDate = document.getElementById('pickedDate')

    console.log(info.dateStr)
}