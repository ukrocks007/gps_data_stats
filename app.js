var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fs = require("fs");
var mustache = require("mustache");
const request = require("request");
const GPX = require("./helpers/gpx");
const gpx = new GPX();
const _ = require("lodash");
var app = express();

// view engine setup
app.engine("html", function(filePath, options, callback) {
  fs.readFile(filePath, function(err, content) {
    if (err) return callback(err);
    var rendered = mustache.to_html(content.toString(), options);
    return callback(null, rendered);
  });
});
app.set("view engine", "html");
app.set("views", __dirname + "/views");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/**
 * Render HTML from the points
 */
app.get("/", async (req, res, next) => {
  request.get(
    "https://dl.dropboxusercontent.com/s/8nvqnasci6l76nz/Problem.gpx",
    {},
    (err, d) => {
      gpx.parse(d.body);
      const total_distance =
        Math.round((gpx.tracks[0].distance.total / 1000) * 100) / 100;
      const elevation = {
        min: Math.floor(gpx.tracks[0].elevation.min),
        max: Math.floor(gpx.tracks[0].elevation.max),
        avg: Math.floor(gpx.tracks[0].elevation.avg)
      };
      const speed = {
        max: Math.floor(gpx.tracks[0].speed.max),
        avg: Math.floor(gpx.tracks[0].speed.avg)
      };
      const time = Math.floor(gpx.tracks[0].time.totalMoving / 3.6e6);

      console.log(
        total_distance + " KM",
        elevation.min + " M",
        elevation.max + " M",
        elevation.avg + " M",
        speed.max + " KM/h",
        speed.avg + " KM/h",
        time + " Hours"
      );
      const parsedPoint = _.map(gpx.tracks[0].points, function(el) {
        return JSON.stringify(el);
      });

      const data = {
        total_distance: total_distance,
        elevation: elevation,
        speed: speed,
        time: time,
        points: parsedPoint,
        APIKEY: process.env["G_API_KEY"]
      };

      return res.render("map", data);
    }
  );
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
