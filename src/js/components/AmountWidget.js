import {select,settings} from '../settings.js';

class AmountWidget {
  constructor(element){
    const thisWidget = this;
    thisWidget.value = settings.amountWidget.defaultValue;

    thisWidget.getElements(element);
    thisWidget.input.value = settings.amountWidget.defaultValue;
    thisWidget.setValue();
    thisWidget.initActions();
  }
  getElements(element){
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }
  setValue(value){
    const thisWidget = this;
    //console.log('thisWidget-VALUE-VALUE---------------------->', thisWidget);
    const newValue = parseInt(value);

    if(newValue !== thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
      thisWidget.value = newValue;
      thisWidget.announce();
      thisWidget.input.value = thisWidget.value;
    }
  }
  announce(){
    const thisWidget = this;
    const event = new Event ('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
  initActions(){
    const thisWidget = this;
    thisWidget.input.addEventListener('change', thisWidget.setValue(thisWidget.value));
    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click',function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
      //console.log('thisWidget-Value:', thisWidget.value)
    });
    // const value = thisWidget.value;
    //console.log('WIDGET VALUE:', value);
  }
}
export default AmountWidget;
