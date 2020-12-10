import {select, templates} from '../settings.js';
//import utils from '../utils.js';


class MainPage {
  constructor(wrapper) {
    const thisMainPage = this;
    thisMainPage.render(wrapper);

  }
  render(wrapper){
    const thisMainPage = this;
    thisMainPage.dom = {};
    thisMainPage.dom.wrapper = wrapper;
    const generatedHTML = templates.mainPage(select.templateOf.mainPage);
    thisMainPage.dom.wrapper.innerHTML = generatedHTML;

    thisMainPage.dom.wrapper.generalWrapper = thisMainPage.dom.wrapper.querySelector(select.containerOf.mainGeneral);
    console.log('thisMainPage.dom.wrapper.generalWrapper', thisMainPage.dom.wrapper.generalWrapper);
    //thisMainPage.dom.wrapper.general.element = utils.createDOMFromHTML(generatedHTML2);
    thisMainPage.generalImage = document.querySelector(select.containerOf.main);
    //thisMainPage.generalImage.appendchild(thisMainPage.element);
    const img1 = document.getElementsByClassName(select.mainGeneral.images);
    console.log('img1', img1);
    console.log('img1.lenght', img1.lenght);
    console.log('img1.1', img1.item(0));
    console.log('img1.1.1-namedItem', img1.namedItem('gen-img-1'));
    console.log('img1.lenght', img1.lenght);

    const img2 = document.querySelectorAll(select.mainGeneral.images);
    console.log('img2', img2);
    console.log('img2.lenght', img2.lenght);
    const generalImages = Array.from(document.getElementsByClassName(select.mainGeneral.images));
    console.log('generalImages', generalImages);
    const generalImages2 = Array.from(document.querySelectorAll(select.mainGeneral.images));
    console.log('generalImages2', generalImages2);
    thisMainPage.dom.wrapper.generalWrapper.innerHTML = img1;

    console.log('thisMainPage', thisMainPage);
  }

}
export default MainPage;