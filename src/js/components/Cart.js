import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';



class Cart {
  constructor(element){

    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
    //console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = document.querySelector(select.cart.productList);
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  update(){
    const thisCart = this;
    console.log('thisCart:', thisCart);
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for(let product of thisCart.products){
      console.log('product:', product);
      thisCart.totalNumber += thisCart.amount;
      thisCart.subtotalPrice += thisCart.price;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    //console.log('thisCart.totalNumber', thisCart.totalNumber);
    //console.log('thisCart.subtotalPice', thisCart.subtotalPrice);
    //console.log('thisCart.totalPrice', thisCart.totalPrice);
    for(let key in thisCart.renderTotalsKeys){
      for(let elem in thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }
  remove(cartProduct){
    const thisCart = this;

    console.log('hi, remover');
    const index = thisCart.products.indexOf(cartProduct);
    console.log('indexOfCartProduct:', index);
    const removed = thisCart.products.splice([index],1);
    console.log('removed:', removed);
    const toRemove = cartProduct.dom.wrapper;
    console.log('toRemove', toRemove);
    toRemove.remove();
    thisCart.update();

  }
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.address.value,
      phone: thisCart.phone.value,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalPrice: thisCart.totalPrice,
      products: [],
    };
    console.log('address', thisCart.address);
    for(let elem of thisCart.products){
      const result = elem.getData();
      console.log('result', result);
      payload.products.push(result);
    }

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
}
export default Cart;