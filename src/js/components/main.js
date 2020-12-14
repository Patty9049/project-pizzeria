import {settings, select, templates} from '../settings.js';
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

    thisMainPage.dom.images = {};
    console.log('thisMainPage', thisMainPage);
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
    thisMainPage.images = {};
    const general = thisMainPage.data[0];
    thisMainPage.images.general = general;
    const carousel = thisMainPage.data[1];
    thisMainPage.images.carousel = carousel;
    const gallery = thisMainPage.data[2];
    thisMainPage.images.gallery = gallery;

    // METODA NA EL Z MAINPAGE.DATA?
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

    thisMainPage.dom.generalImgList = document.querySelector(select.mainGeneral.imgList);
    for(let item of thisMainPage.images.general.images){
      const genImg = item;
      thisMainPage.dom.generalImgList.innerHTML += genImg;
    }
    thisMainPage.dom.gallery = document.querySelector(select.mainGallery.gallery);
    const row1 = document.createElement('div');
    row1.classList.add('row1');
    const row2 = document.createElement('div');
    row2.classList.add('row2');
    thisMainPage.dom.gallery.appendChild(row1);
    thisMainPage.dom.gallery.appendChild(row2);

    thisMainPage.images.gallery.images.filter((img) => {
      if(thisMainPage.images.gallery.images.indexOf(img) <= 2){
        row1.innerHTML += img;
      } else {
        row2.innerHTML += img;
      }
    });
  }
}
export default MainPage;