import { templates, select, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(wrapper){
    const thisBooking = this;

    thisBooking.render(wrapper);
    thisBooking.initWidgets();
    thisBooking.getData();

  }
  getData(){
    const thisBooking = this;
    const endDate = new Date(thisBooking.datePicker.maxDate);
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(endDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,

      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };
    // console.log('urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        console.log('bookings:', bookings);
        console.log('eventsCurrent:', eventsCurrent);
        console.log('eventsRepeat:', eventsRepeat);
      });
  
  }
  // parseData(bookings, eventsCurrent, eventsRepeat){
  //   const thisBooking = this;

  //   console.log('bookings:', bookings);
  //   console.log('eventsCurrent:', eventsCurrent);
  //   console.log('eventsRepeat:', eventsRepeat);

  //   thisBooking.booked = {};

  //   // for(let item of eventsCurrent){
  //   //   console.log(item);
  //   // }
  // }
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
  }
  initWidgets() {
    const thisBooking = this;
    console.log('thisBooking', thisBooking);

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.wrapper);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.HourPicker = new HourPicker(thisBooking.dom.hourPicker);

  }
}

export default Booking;