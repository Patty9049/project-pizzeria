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
    // thisBooking.colorRangeSlider();
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

    // COLOR RANGE SLIDER

    console.log('COLOR RANGE SLIDER');
    console.log('thisBooking', thisBooking);
    console.log('thisBookig.booked', thisBooking.booked);

    for(let dElem in thisBooking.booked){
      thisBooking.colorValues = [];
      for(let hElem in thisBooking.booked[dElem]){

        const red = 'red';
        const orange = 'orange';
        const green = 'green';

        if(dElem == thisBooking.datePicker.dom.input.value){
          if(thisBooking.booked[dElem][hElem].length >= 3){
            thisBooking.colorValues.push(red);
          } else if(thisBooking.booked[dElem][hElem].length == 2){
            thisBooking.colorValues.push(orange);
          }else if(thisBooking.booked[dElem][hElem] <= 1 || thisBooking.booked[dElem] == null ){
            thisBooking.colorValues.push(green);
          } else {
            thisBooking.colorValues.push(green);
          }

          const colorsToString = thisBooking.colorValues.join(', ');
          console.log('colorsToString', colorsToString);

          const RSFill =  thisBooking.dom.hourPicker.querySelector('.rangeSlider__horizontal').style.background = `linear-gradient(to right, ${colorsToString})`;
          console.log('RSFill', RSFill);
        }
      }
    }
    thisBooking.dom.datePicker.addEventListener('change', function(){
      for(let dElem in thisBooking.booked){
        thisBooking.colorValues = [];
        for(let hElem in thisBooking.booked[dElem]){

          const red = 'red';
          const orange = 'orange';
          const green = 'green';

          if(dElem == thisBooking.datePicker.dom.input.value){
            if(thisBooking.booked[dElem][hElem].length >= 3){
              thisBooking.colorValues.push(red);
            } else if(thisBooking.booked[dElem][hElem].length == 2){
              thisBooking.colorValues.push(orange);
            }else if(thisBooking.booked[dElem][hElem] <= 1 || thisBooking.booked[dElem] == null ){
              thisBooking.colorValues.push(green);
            } else {
              thisBooking.colorValues.push(green);
            }
            const colorsToString = thisBooking.colorValues.join(', ');
            console.log('colorsToString', colorsToString);
            const RSFill =  thisBooking.dom.hourPicker.querySelector('.rangeSlider__horizontal').style.background = `linear-gradient(to right, ${colorsToString})`;
            console.log('RSFill', RSFill);
          }
        }
      }

    });
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
      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
        table.classList.add(classNames.booking.tableBooked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
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
      location.reload();
    });
    // thisBooking.datePicker.dom.input.addEventListener('change', function(e){
    //   e.preventDefault();
    //   thisBooking.parseData();
    // });
  }

  sendOrder(){
    const thisBooking = this;
    console.log(thisBooking);
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.HourPicker.value);
    const url = settings.db.url + '/' + settings.db.booking;
    const bookedTables = [];
    for(let table of thisBooking.dom.tables){
      if(table.classList.contains(classNames.booking.tableBooked) && thisBooking.booked){
        const tableId = table.getAttribute('data-table');
        if( !isNaN(tableId)){
          const tableIdNumber = parseInt(tableId);
          bookedTables.push(tableIdNumber);
          thisBooking.bookedTables = bookedTables;
        }
      }
    }
    const startersArray = [];
    const starters = Array.from(thisBooking.dom.wrapper.querySelectorAll(select.booking.startersCheckboxWrapper));

    for (let starter of starters){
      const checkboxInput = starter.querySelector(select.booking.startersCheckboxInput);
      if(checkboxInput.checked){
        startersArray.push(checkboxInput.value);
      }
    }
    const payload = {
      date: thisBooking.datePicker.correctValue,
      hour: thisBooking.HourPicker.correctValue,
      table: parseInt(bookedTables.toString()),
      duration: thisBooking.hoursAmount.correctValue,
      ppl: thisBooking.peopleAmount.correctValue,
      starters: startersArray,
      phone: thisBooking.phone.value,
      address: thisBooking.address.value
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    thisBooking.payload = payload;
    console.log('payload', payload);

    fetch(url,options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
        thisBooking.response = parsedResponse;
        // console.log('thisBooking.response', thisBooking.response);
        console.log('thisBooking.booked', thisBooking.booked);

        thisBooking.reserv = {};
        thisBooking.reserv.hour = thisBooking.response.hour;
        thisBooking.reserv.date = thisBooking.response.date;
        // console.log('thisBooking.reserv.hour', thisBooking.reserv.hour);
        // console.log('TYPEOFthisBooking.reserv.hour', typeof(thisBooking.reserv.hour));
        // console.log('thisBooking.reserv.date', thisBooking.reserv.date);
        thisBooking.updateDOM();
        // if( typeof thisBooking.reserv.hour !== 'udefined')
      });


    for(let table of thisBooking.dom.tables){
      const tableId = table.getAttribute('data-table');
      const tableIdNumber = parseInt(tableId);
      // console.log('thisBooking.booked[thisBooking.date]', thisBooking.booked[thisBooking.date]);
      thisBooking.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisBooking.sendOrder();
      });
      // console.log('', );

      if(thisBooking.booked[thisBooking.date][thisBooking.hour].includes[tableIdNumber]){
        table.classList.add(classNames.booking.tableBooked);
      }
      if(table.classList.contains('booked')){
        table.classList.add(classNames.booking.tableBooked);
      }
    }
    thisBooking.updateDOM();
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
    thisBooking.phone = thisBooking.dom.form.querySelector(select.booking.phone);
    thisBooking.address = thisBooking.dom.form.querySelector(select.booking.address);
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
