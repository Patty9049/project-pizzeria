import {settings, select, templates,} from '../settings.js';
import utils from '../utils.js';


class MainPage {
  constructor(wrapper) {
    const thisMainPage = this;
    thisMainPage.render(wrapper);
    thisMainPage.getData();
  }
  render(wrapper){
    const thisMainPage = this;
    thisMainPage.dom = {};
    thisMainPage.dom.wrapper = wrapper;

    const generatedHTML = templates.mainPage(thisMainPage.data);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisMainPage.dom.mainWrapper = document.querySelector(select.containerOf.main);
    thisMainPage.dom.mainWrapper.appendChild(generatedDOM);
    thisMainPage.dom.wrapper.appendChild(generatedDOM);
    thisMainPage.dom.generalImgList = document.querySelector(select.mainGeneral.imgList);
    thisMainPage.dom.generalImgList.order = document.querySelector('.general__order');
    thisMainPage.dom.generalImgList.book = document.querySelector('.general__book');

    thisMainPage.dom.images = {};
  }
  getData() {
    const thisMainPage = this;
    const url2 = settings.db.url + '/' + settings.db.main;
    fetch(url2)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function (parsedResponse){
        thisMainPage.data = {};
        thisMainPage.data = parsedResponse;
        thisMainPage.arrangeData(parsedResponse);
      });
  }
  arrangeData() {
    const thisMainPage = this;
    thisMainPage.images = {};
    const general = thisMainPage.data[0];
    thisMainPage.images.general = general;
    const carousel = thisMainPage.data[1];
    thisMainPage.images.carousel = carousel;
    const gallery = thisMainPage.data[2];
    thisMainPage.images.gallery = gallery;
    thisMainPage.dom.gallery = document.querySelector(select.mainGallery.gallery);

    if(thisMainPage.images.general.images[0]){
      const genImg = thisMainPage.images.general.images[0];
      thisMainPage.dom.generalImgList.order.insertAdjacentHTML('afterbegin', genImg);
    }
    if(thisMainPage.images.general.images[1]){
      const genImg = thisMainPage.images.general.images[1];
      thisMainPage.dom.generalImgList.book.insertAdjacentHTML('afterbegin', genImg);
    }

    /* carousel*/

    thisMainPage.dom.carousel = document.querySelector(select.mainCarousel.carouselDiv);
    thisMainPage.dom.carousel.slide1 = document.querySelector('.slide1');
    thisMainPage.dom.carousel.slide2 = document.querySelector('.slide2');
    thisMainPage.dom.carousel.slide3 = document.querySelector('.slide3');

    if(thisMainPage.dom.carousel.slide1){
      const carImg = '<div class="image">' + thisMainPage.images.carousel.images[0] + '</div>';
      thisMainPage.dom.carousel.slide1.insertAdjacentHTML('afterbegin', carImg);
    }
    if(thisMainPage.dom.carousel.slide2){
      const carImg = '<div class="image">' + thisMainPage.images.carousel.images[1] + '</div>';
      thisMainPage.dom.carousel.slide2.insertAdjacentHTML('afterbegin', carImg);
    }
    if(thisMainPage.dom.carousel.slide3){
      const carImg = '<div class="image">' + thisMainPage.images.carousel.images[2] + '</div>';
      thisMainPage.dom.carousel.slide3.insertAdjacentHTML('afterbegin', carImg);
    }

    thisMainPage.dom.carousel = document.querySelector(select.mainCarousel.carouselDiv);
  }

  // links() {
  //   const thisMainPage = this;
  //   console.log('window.location', window.location);
  //   console.log('window.location.hash', window.location.hash);
  //   thisMainPage.dom.generalImgList.order.addEventListener('click', function(){
  //     console.log('ORDER');
  //     const clickedElement = this;

  //     const clickId = clickedElement.getAttribute('id');
  //     console.log('clickId', clickId);
  //     // const newPart = '#/' + clickId;
  //     // console.log('newPart', newPart);
  //     window.location.hash = '#/' + clickId;

  //   });
  // }
  // activateSubpage(clickId){
  //   const thisApp = this;
  //   for(let page of thisApp.pages){
  //     page.classList.toggle(classNames.pages.active, page.id == clickId);
  //   }
  //   for(let link of thisApp.navLinks){
  //     link.classList.toggle(
  //       classNames.nav.active,
  //       link.getAttribute('href') == '#' + clickId
  //     );
  //   }
}


export default MainPage;