const { JSDOM } = require("jsdom");
const moment = require("moment");
var DOMParser = new JSDOM().window.DOMParser;

var gpxParser = function() {
  this.xmlSource = "";
  this.waypoints = [];
  this.tracks = [];
  this.routes = [];
};

gpxParser.prototype.parse = function(string) {
  var keepThis = this;
  var domParser = new DOMParser();
  this.xmlSource = domParser.parseFromString(string, "text/xml");

  var wpts = [].slice.call(this.xmlSource.querySelectorAll("wpt"));
  for (let idx in wpts) {
    var wpt = wpts[idx];
    let pt = {};
    pt.name = keepThis.getElementValue(wpt, "name");
    pt.lat = parseFloat(wpt.getAttribute("lat"));
    pt.lng = parseFloat(wpt.getAttribute("lon"));
    pt.ele = parseFloat(keepThis.getElementValue(wpt, "ele"));
    pt.time = parseFloat(keepThis.getElementValue(wpt, "time"));
    pt.cmt = keepThis.getElementValue(wpt, "cmt");
    pt.desc = keepThis.getElementValue(wpt, "desc");
    keepThis.waypoints.push(pt);
  }

  var rtes = [].slice.call(this.xmlSource.querySelectorAll("rte"));
  for (let idx in rtes) {
    var rte = rtes[idx];
    let route = {};
    route.name = keepThis.getElementValue(rte, "name");
    route.cmt = keepThis.getElementValue(rte, "cmt");
    route.desc = keepThis.getElementValue(rte, "desc");
    route.src = keepThis.getElementValue(rte, "src");
    route.number = keepThis.getElementValue(rte, "number");
    route.link = keepThis.getElementValue(rte, "link");
    route.type = keepThis.getElementValue(rte, "type");

    let routepoints = [];
    var rtepts = [].slice.call(rte.querySelectorAll("rtept"));

    for (let idxIn in rtepts) {
      var rtept = rtepts[idxIn];
      let pt = {};
      pt.lat = parseFloat(rtept.getAttribute("lat"));
      pt.lng = parseFloat(rtept.getAttribute("lon"));
      pt.ele = parseFloat(keepThis.getElementValue(rtept, "ele"));
      pt.time = parseFloat(keepThis.getElementValue(rtept, "time"));
      routepoints.push(pt);
    }

    route.distance = keepThis.calculDistance(routepoints);
    route.elevation = keepThis.calcElevation(routepoints);
    route.time = keepThis.calculTime(routepoints);
    route.points = routepoints;
    keepThis.routes.push(route);
  }

  var trks = [].slice.call(this.xmlSource.querySelectorAll("trk"));
  for (let idx in trks) {
    var trk = trks[idx];
    let track = {};

    track.name = keepThis.getElementValue(trk, "name");
    track.cmt = keepThis.getElementValue(trk, "cmt");
    track.desc = keepThis.getElementValue(trk, "desc");
    track.src = keepThis.getElementValue(trk, "src");
    track.number = keepThis.getElementValue(trk, "number");
    track.link = keepThis.getElementValue(trk, "link");
    track.type = keepThis.getElementValue(trk, "type");

    let trackpoints = [];
    var trkpts = [].slice.call(trk.querySelectorAll("trkpt"));
    for (let idxIn in trkpts) {
      var trkpt = trkpts[idxIn];
      let pt = {};
      pt.lat = parseFloat(trkpt.getAttribute("lat"));
      pt.lng = parseFloat(trkpt.getAttribute("lon"));
      pt.ele = parseFloat(keepThis.getElementValue(trkpt, "ele"));
      pt.time = keepThis.getElementValue(trkpt, "time");
      trackpoints.push(pt);
    }
    track.distance = keepThis.calculDistance(trackpoints);
    track.elevation = keepThis.calcElevation(trackpoints);
    track.time = keepThis.calculTime(trackpoints);
    track.speed = keepThis.calculSpeed(trackpoints);
    track.points = trackpoints;
    keepThis.tracks.push(track);
  }
};

gpxParser.prototype.getElementValue = function(parent, needle) {
  let elem = parent.querySelector(" :scope > " + needle);
  if (elem != null) {
    return elem.innerHTML;
  }
  return elem;
};

gpxParser.prototype.calculDistance = function(points) {
  let distance = {};
  let totalDistance = 0;
  let cumulDistance = [];
  for (var i = 0; i < points.length - 1; i++) {
    totalDistance += this.calcDistanceBetween(points[i], points[i + 1]);
    cumulDistance[i] = totalDistance;
  }
  cumulDistance[points.length - 1] = totalDistance;

  distance.total = totalDistance;
  distance.cumul = cumulDistance;

  return distance;
};

gpxParser.prototype.calcDistanceBetween = function(wpt1, wpt2) {
  let latlng1 = {};
  latlng1.lat = wpt1.lat;
  latlng1.lng = wpt1.lng;
  let latlng2 = {};
  latlng2.lat = wpt2.lat;
  latlng2.lng = wpt2.lng;
  var rad = Math.PI / 180,
    lat1 = latlng1.lat * rad,
    lat2 = latlng2.lat * rad,
    sinDLat = Math.sin(((latlng2.lat - latlng1.lat) * rad) / 2),
    sinDlng = Math.sin(((latlng2.lng - latlng1.lng) * rad) / 2),
    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng,
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371000 * c;
};

gpxParser.prototype.calcTimeBetween = function(pt1, pt2) {
  const sDate = moment(pt1.time);
  const eDate = moment(pt2.time);
  a = eDate.diff(sDate);
  return a;
};
gpxParser.prototype.calcTimeBetweenMoving = function(pt1, pt2) {
  if (pt1.lat == pt2.lat || pt1.lng == pt2.lng) {
    return 0;
  }
  const sDate = moment(pt1.time);
  const eDate = moment(pt2.time);
  a = eDate.diff(sDate);
  return a;
};

gpxParser.prototype.calculTime = function(points) {
  let time = {};
  let totalTimeMoving = 0;
  let cumulTime = [];
  for (var i = 0; i < points.length - 1; i++) {
    totalTimeMoving += this.calcTimeBetweenMoving(points[i], points[i + 1]);
    cumulTime[i] = totalTimeMoving;
  }
  cumulTime[points.length - 1] = totalTimeMoving;

  time.totalMoving = totalTimeMoving;

  return time;
};

gpxParser.prototype.calculSpeed = function(points) {
  let speed = {};
  let sum = 0;
  let cmulSpeed = [];
  for (var i = 0; i < points.length - 1; i++) {
    const timeInstance = this.calcTimeBetween(points[i], points[i + 1]) / 3.6e6;
    const distanceInstance =
      this.calcDistanceBetween(points[i], points[i + 1]) / 1000;
    const speed = distanceInstance / timeInstance;
    cmulSpeed.push(speed);
    sum += speed;
  }

  speed.max = Math.max.apply(null, cmulSpeed);
  speed.avg = sum / cmulSpeed.length;

  return speed;
};

gpxParser.prototype.calcElevation = function(points) {
  var ret = {};

  var elevation = [];
  var sum = 0;

  for (var i = 0, len = points.length; i < len; i++) {
    var ele = parseFloat(points[i].ele);
    elevation.push(ele);
    sum += ele;
  }

  ret.max = Math.max.apply(null, elevation);
  ret.min = Math.min.apply(null, elevation);
  ret.avg = sum / elevation.length;

  return ret;
};

gpxParser.prototype.isEmpty = function(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }
  return true;
};
module.exports = gpxParser;
