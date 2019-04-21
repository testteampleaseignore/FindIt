
/* Copied this from StackOverflow;
   See Python's partial function 
   https://docs.python.org/2/library/functools.html#functools.partial */
function partial() {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  return function() {
    var nextArgs = Array.prototype.slice.call(arguments);
    // replace null values with new arguments
    args.forEach(function(val, i) {
      if (val === null && nextArgs.length) {
        args[i] = nextArgs.shift();
      }
    });
    // if we have more supplied arguments than null values
    // then append to argument list
    if (nextArgs.length) {
      nextArgs.forEach(function(val) {
        args.push(val);
      });
    }
    return fn.apply(fn, args);
  }
}


function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          partial(updatePosition, callback));
    }
    return null;
};

function updatePosition(callback, position) {
  if (position) {

    // update globals holding current coords
    window.lat = position.coords.latitude;
    window.lng = position.coords.longitude;

    // console.log(position, callback);
    callback(window.lat, window.lng);
  }
}

function distance(lat1, lon1, lat2, lon2) {

  var radlat1 = Math.PI * lat1/180;
  var radlat2 = Math.PI * lat2/180;
  var theta = lon1-lon2;
  var radtheta = Math.PI * theta/180;
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = dist * 180/Math.PI;
  dist = dist * 60 * 1.1515;

  // get distance in feet, not miles
  return dist * 5280;
} 