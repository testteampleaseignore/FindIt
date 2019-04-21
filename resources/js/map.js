
// default map center to Central Boulder
window.lat = 40.0150;
window.lng = -105.2705;

// setup unitialized google maps Map and Marker objects
var map, mark;

// define an initialize function for google maps 
// libraries to call and attach it to the window
window.initialize = function() {
  map = new google.maps.Map(document.getElementById('map-canvas'), {center:{lat:lat,lng:lng},zoom:17});
  mark = new google.maps.Marker({position:{lat:lat, lng:lng}, map:map});
};

// define a redraw function, for updating the lat/lng
function redraw(lat, lng) {
  map.setCenter({lat:lat, lng:lng, alt:0});
  mark.setPosition({lat:lat, lng:lng, alt:0});
};