/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      //thisProduct.initAmountWidget();
      thisProduct.processOrder();

      console.log('new Product:', thisProduct);
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
        const activeProducts = document.getElementsByClassName('product' + 'active');
        //console.log('activeProducts:', activeProducts);
        for (let activePruduct of activeProducts) {
          activePruduct.classList.toogle('active');
        }
        thisProduct.element.classList.toggle('active');
      });
    }
    initOrderForm() {
      const thisProduct = this;
      console.log('initOrderForm');
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
      });
    }

    processOrder() {
      const thisProduct = this;
      //console.log('processOrder');
      //console.log(thisProduct)
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);
      let productPrice = thisProduct.data.price;
      //console.log('PRODUCT-PRICE:', productPrice);
      const params = thisProduct.data.params;
      //console.log('PRODUCT-PARAMS:', params);
      for(let paramId in params) {
        console.log('ID:', paramId);
        const param = params[paramId];
        console.log('PRODUCT-PARAM:', param);
        const options = param.options;
        for(let optionId in options){
          const option = param.options[optionId];
          //console.log('OPCJA:', option);
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          if(optionSelected && !option.default){
            productPrice += option.price;
          } else if (!optionSelected && option.default) {
            productPrice -= option.price;
          }
          if(optionSelected){
            //let imgSelector = option.querySelectorAll(`img .${param}-${option}`);
            //const allImages = thisProduct.imageWrapper.querySelectorAll(imgSelector);
            //console.log('ALL-IMAGES:', allImages);
          }
        }
      }
      const totalPrice = thisProduct.element.getElementsByClassName('product__total-price price');
      console.log('TYPE-OF__TOTAL-PRICE:',typeof(totalPrice));
      console.log(totalPrice);
      console.log('PP:', productPrice);
      totalPrice.innerHTML = '';
      thisProduct.priceElem.innerHTML = productPrice;
      
    }
    //<--------------ODBLOKUJ WIDGET
    /*initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      console.log('New AmountWgdet:', thisProduct);
    }*/
  }

  /*class AmountWidget {
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
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
      const newValue = parseInt(value);

      //VALIDATION

      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;
    }
    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', thisWidget.setValue(thisWidget.value));
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
      const value = thisWidget.value;
      console.log('WIDGET VALUE:', value);
    }
  }*/

  const app = {
    initMenu: function () {
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
