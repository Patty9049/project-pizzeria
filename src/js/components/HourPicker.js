import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import {settings, select} from '../settings.js';


class HourPicker extends BaseWidget {
  constructor(wrapper){

    super(wrapper, settings.hours.open);
    const thisWidget = this;

    //thisWidget.dom.wrapper = document.querySelector(select.widgets.hourPicker.wrapper);
    thisWidget.dom.input = document.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = document.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin(){
    const thisWidget = this;
    // eslint-disable-next-line no-undef
    rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
  }

  parseValue(value){
    const hour = utils.numberToHour(value);
    return hour;
  }
  isValid(){
    return true;
  }
  renderValue(){
    const thisWidget = this;
    thisWidget.dom.output = thisWidget.value;
  }
  
}

export default HourPicker;