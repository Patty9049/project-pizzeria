import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(wrapper) {
    const thisBooking = this;
  
    thisBooking.render(wrapper);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initActions();
  }
  getData() {
    const thisBooking = this;
    const endDate = utils.addDays(
      thisBooking.datePicker.minDate,
      settings.datePicker.maxDaysInFuture
    );
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey + '=' + utils.dateToStr(endDate);
    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };
    const urls = {
      booking:
        settings.db.url + '/' + settings.db.booking +
                          '?' + params.booking.join('&'),
      eventsCurrent:
        settings.db.url + '/' + settings.db.event +
                          '?' + params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url + '/' + settings.db.event +
                          '?' + params.eventsRepeat.join('&'),
    };
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};
    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = utils.dateToStr(thisBooking.datePicker.minDate);
    const maxDate = thisBooking.datePicker.max;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1) ) {
          thisBooking.makeBooked(loopDate, item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.HourPicker.value);
    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if( !isNaN(tableId) ){
        tableId = parseInt(tableId);
      }
      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1 ){
        table.classList.add(classNames.booking.tableBooked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }
      if (allAvailable){
        table.addEventListener('click', function(e){
          e.preventDefault();
          table.classList.toggle(classNames.booking.tableBooked);
        });
      }

    }
  }
  initActions(){
    const thisBooking = this;
    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendOrder();
    });
  }
  sendOrder(){
    const thisBooking = this;
    console.log(thisBooking);
    const url = settings.db.url + '/' + settings.db.booking;
    console.log('URL', url);
    thisBooking.id = [];
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if( !isNaN(tableId) ){
        tableId = parseInt(tableId);
      }
      if(table.classList.contains(classNames.booking.tableBooked) && !thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1){
        const id = table.getAttribute(settings.booking.tableIdAttribute);
        thisBooking.id.push(id);
      }
    }
    thisBooking.starters = [];
    const starters = Array.from(thisBooking.dom.wrapper.querySelectorAll(select.booking.startersCheckboxWrapper));
    console.log('staters.array', starters);
    for (let starter of starters){
      const starterText = starter.innerText;
      if(starter.checked){
        thisBooking.starters.push(starterText);
      }
    }
    const payload = {
      date: thisBooking.datePicker.correctValue,
      hour: thisBooking.HourPicker.correctValue,
      table: [...thisBooking.id],
      duration: thisBooking.hoursAmount.correctValue,
      ppl: thisBooking.peopleAmount.correctValue,
      starters: thisBooking.starters,
    };
    console.log('PAYLOAD', payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url,options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });


  }
  render(wrapper) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = wrapper;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.wrapper);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.HourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }
}

export default Booking;
