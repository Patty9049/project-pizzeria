import {settings, select, templates} from '../settings.js';
import utils from '../utils.js';


class MainPage {
  constructor(wrapper) {
    const thisMainPage = this;
    thisMainPage.render(wrapper);
    thisMainPage.getData();
    thisMainPage.addImages();
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

    thisMainPage.dom.images = {};
    console.log('thisMainPage', thisMainPage);
    console.log('thisMainPage.dom', thisMainPage.dom);
    console.log('generatedDOM', generatedDOM);
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
    console.log('thisMainPage.data', thisMainPage.data);

    const general = thisMainPage.data[0];
    console.log('general', general);
    thisMainPage.dom.images.general = general;

    const carousel = thisMainPage.data[1];
    console.log('carousel', carousel);
    thisMainPage.dom.images.carousel = carousel;

    const gallery = thisMainPage.data[2];
    console.log('gallery', gallery);
    thisMainPage.dom.images.gallery = gallery;

    // for(let item of thisMainPage.data){
    //   console.log('ITEM', item);
    //   const name2 = item.class;
    //   console.log('name', name);

    //   const $(name2) = {
    //     class: item.class,
    //  images: item.images,
    //   }
    // }

    // const MainDataSections = thisMainPage.data.map((el) => {
    //   return (el.class = {
    //     class: el.class,
    //     images: el.images
    //   });
    // });
    // console.log('mainDataSections', MainDataSections);
  }
  addImages(){
    
  }

}
export default MainPage;