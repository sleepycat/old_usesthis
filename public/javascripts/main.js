import map from './map'
import Geocoder from './geocoder'

let searchField = document.querySelector('#search_field');

let searchButton = document.querySelector('#search_button')


let enterKeyPressedinSearchField = (e) => {
  if(e.keyCode === 13){
    geocode(e);
  }
}

let geocode = (e) => {
  Geocoder.geocode(searchField.value).then((res) => {
    map.setCenter([res.lng, res.lat], 10);
  });
  return false;
}

searchButton.addEventListener('click', geocode);
searchField.addEventListener('keydown', enterKeyPressedinSearchField);
