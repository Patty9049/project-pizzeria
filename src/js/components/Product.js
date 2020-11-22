import {select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //console.log('new Product:', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
  }

  initAccordion() {
    const thisProduct = this;
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      //console.log('clicked');
      event.preventDefault();
      thisProduct.element.classList.toggle('active');
      const activeProducts = document.getElementsByClassName('product ' + 'active');
      for (let activePruduct of activeProducts) {
        if(activePruduct!=thisProduct.element)
          activePruduct.classList.remove('active');
      }
    });
  }
  initOrderForm() {
    const thisProduct = this;
    //console.log('initOrderForm');
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
    //console.log('processOrder');
    //console.log(thisProduct);
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    thisProduct.params = {};
    //console.log('thisProduct.params:', thisProduct.params)


    let productPrice = thisProduct.data.price;
    //console.log('PRODUCT-PRICE:', productPrice);
    const params = thisProduct.data.params;
    //console.log('PRODUCT-PARAMS:', params);
    for(let paramId in params) {
      //console.log('ID:', paramId);
      const param = params[paramId];
      //console.log('PRODUCT-PARAM:', param);
      const options = param.options;
      for(let optionId in options) {
        const option = param.options[optionId];
        //console.log('PRODUCT-OPTION:', option);
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        if (optionSelected && !option.default) {
          productPrice += option.price;
        } else if (!optionSelected && option.default) {
          productPrice -= option.price;
        }
        /* WIDOCZNOŚĆ OBRAZKÓW */
        const imgSelector = '.' + paramId + '-' + optionId;
        const image = thisProduct.imageWrapper.querySelector(imgSelector);
        if (image) {
          if (optionSelected) {
            if(!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;
            image.classList.add('active');
          } else {
            image.classList.remove('active');
          }
        }
      }
    }
    const totalPrice = thisProduct.element.getElementsByClassName('product__total-price price');
    totalPrice.innerHTML = '';
    totalPrice.innerHTML = productPrice;
    thisProduct.priceSingle = productPrice;
    thisProduct.productPrice = thisProduct.priceSingle * thisProduct.amountWidget.value;

    thisProduct.priceElem.innerHTML = thisProduct.productPrice;
    thisProduct.price = thisProduct.productPrice;

  }
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    //console.log('thisProduct.amountWidget:', thisProduct.amountWidget);
    //console.log('thisProduct.amountWidgetElem:', thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }
  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    //console.log('thisProduct:', thisProduct);
    //app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });
    thisProduct.element.dispatchEvent(event);
  }
}
export default Product;