/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

//const { utils } = require("stylelint");

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 5,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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


      //console.log('PRODUCT-PRICE:', productPrice);
      //productPrice *= thisProduct.amountWidget.value;
      //totalPrice.innerHTML = productPrice;
      //console.log('PRODUCT-PRICE:', productPrice);
      //thisProduct.priceElem.innerHTML = productPrice;
      //totalPrice.innerHTML = productPrice;

      /* CENA DO KOSZYKA*/

      /* multiply price by amount */
      thisProduct.priceSingle = productPrice;
      thisProduct.productPrice = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.productPrice;
      thisProduct.price = thisProduct.productPrice;
    }
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      //console.log('New AmountWgdet:', thisProduct);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    addToCart(){
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      //console.log('thisProduct:', thisProduct);

      app.cart.add(thisProduct);
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.getElements(element);
      thisWidget.input.value = settings.amountWidget.defaultValue;  //<--- wartość inputa 1 nie działa;pobiera warosc z HTML'a
      thisWidget.setValue(1);
      thisWidget.initActions();

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);
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

      //VALIDATION - po dodamiu walidacji i usunięciu atrybutu value=1 z HTML'a nie pokazuje ceny tylko NaN.
      if(newValue !== thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
        thisWidget.input.value = thisWidget.value;
      }
    }
    announce(){
      const thisWidget = this;
      const event = new Event ('updated');
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

  class Cart {
    constructor(element){

      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList);
    }
    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct){
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      thisCart.element = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(thisCart.element);

      thisCart.products.push(menuProduct);
      //console.log('thisCart.products:', thisCart.products);
      console.log('menuProduct:', menuProduct);

    }
  }

  class CartProduct {

    constructor(menuProduct, element) {
      const thisCartProduct = this;

      console.log('element-constructor argument:', element);
      console.log('menuProduct-constructor argument:', menuProduct, thisCartProduct.menuProduct);

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount =menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);

      console.log('new CartProduct', thisCartProduct);
    }
    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      console.log('thisCartProduct.dom.wrapper:', thisCartProduct.dom.wrapper);
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }


  }

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

    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
      thisApp.cart.cartProduct = new CartProduct;
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
      thisApp.initCart();
    },
  };

  app.init();
}
