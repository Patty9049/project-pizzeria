import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import {settings, select} from '../settings.js';


class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;
    thisWidget.dom.input = document.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = thisWidget.minDate + settings.datePicker.maxDaysInFuture;
    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
    });
  }
  parseValue(value){
    return value;
  }
  isValid(){
    return true;
  }
  renderValue(){
  }
}

export default DatePicker;